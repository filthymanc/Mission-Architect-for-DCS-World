/*
 * Mission Architect for DCS
 * Copyright (C) 2026 the filthymanc
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {
  GoogleGenAI,
  Chat,
  GenerateContentResponse,
  Content,
  Type,
  FunctionDeclaration,
  Tool,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/genai";
import { SYSTEM_INSTRUCTION, MODELS } from "../../core/constants";
import { Message, ModelType } from "../../core/types";
import { getFrameworkDocs } from "./githubService";
import { SSE_DEFINITIONS } from "../../data/sse-definitions";

const mapMessagesToHistory = (messages: Message[]): Content[] => {
  return messages
    .filter((msg) => !msg.isStreaming && msg.text && msg.text.trim().length > 0)
    .map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));
};

const frameworkDocsTool: FunctionDeclaration = {
  name: "get_framework_docs",
  description:
    "Fetches RAW LUA SOURCE CODE from the official GitHub repositories (MOOSE or DML). Use this to analyze function definitions and header comments directly. Semantic Compression is applied to large files.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      framework: {
        type: Type.STRING,
        description: "Framework name ('MOOSE' or 'DML').",
        enum: ["MOOSE", "DML"],
      },
      module_name: {
        type: Type.STRING,
        description:
          "Name of the module/class to search for (e.g., 'Airboss', 'cloneZones'). The system performs a fuzzy search on the file tree.",
      },
      branch: {
        type: Type.STRING,
        description:
          "Required for MOOSE. 'STABLE' (Master) or 'DEVELOP'. Default is DEVELOP.",
        enum: ["STABLE", "DEVELOP"],
      },
    },
    required: ["framework", "module_name"],
  },
};

const sseDocsTool: FunctionDeclaration = {
  name: "get_sse_docs",
  description:
    "Fetches the Safe Standard Scripting Engine (SSE) Hard Deck Definitions. Use this when the user needs to use standard DCS classes like Group, Unit, Timer, or Trigger. Do not rely on training data for these classes.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: "The SSE Class category to retrieve.",
        enum: ["Group", "Unit", "trigger", "timer", "coalition", "All"],
      },
    },
    required: ["category"],
  },
};

const architectTools: Tool[] = [
  { functionDeclarations: [frameworkDocsTool, sseDocsTool] },
];

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  const ai = new GoogleGenAI({ apiKey });
  try {
    await ai.models.generateContent({
      model: MODELS.FLASH.id,
      contents: { parts: [{ text: "ping" }] },
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const startNewSession = (
  apiKey: string,
  historyMessages: Message[],
  model: ModelType = MODELS.FLASH.id,
  isDesanitized: boolean = false,
): Chat => {
  const ai = new GoogleGenAI({ apiKey });
  const formattedHistory = mapMessagesToHistory(historyMessages);

  const envStatus = isDesanitized
    ? "ENVIRONMENT STATUS: DESANITIZED (UNSAFE)."
    : "ENVIRONMENT STATUS: SANITIZED (LOCKED).";

  const effectiveSystemInstruction = `${SYSTEM_INSTRUCTION}

[SYSTEM CONFIGURATION]
CURRENT_MODEL_ID: ${model}
${envStatus}`;

  return ai.chats.create({
    model: model,
    history: formattedHistory,
    config: {
      systemInstruction: effectiveSystemInstruction,
      temperature: 0.1,
      tools: architectTools,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    },
  });
};

/**
 * Recursive Generator for Multi-Turn Tool Execution
 */
export async function* sendMessageStream(
  chatSession: Chat | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any,
): AsyncGenerator<GenerateContentResponse, void, unknown> {
  if (!chatSession) throw new Error("CHAT_NOT_INITIALIZED");

  let currentTurnMessage = message;
  let turnCount = 0;
  const maxTurns = 5;

  const toolCallHistory = new Set<string>();

  while (turnCount < maxTurns) {
    turnCount++;

    let inputPayload;
    if (typeof currentTurnMessage === "string") {
      inputPayload = { message: currentTurnMessage };
    } else {
      inputPayload = { message: currentTurnMessage };
    }

    let stream;
    try {
      stream = await chatSession.sendMessageStream(inputPayload);
    } catch (e: unknown) {
      console.error("Gemini API Stream Error:", e);

      let errorHint = "";
      const errStr = String(e);
      let detailedError = (e as Error).message || errStr;
      try {
        if ((e as Error).message && (e as Error).message.startsWith("{")) {
          const parsed = JSON.parse((e as Error).message);
          if (parsed.error && parsed.error.message) {
            detailedError = parsed.error.message;
          }
        }
      } catch (jsonErr) {
        // ignore parsing error
      }

      if (errStr.includes("400") || errStr.includes("INVALID_ARGUMENT")) {
        errorHint = "The documentation might be too large (Payload Limit).";
      } else if (errStr.includes("413")) {
        errorHint = "The request payload was too large (413).";
      } else if (errStr.includes("429")) {
        errorHint = "You are sending requests too fast (Rate Limit).";
      } else if (errStr.includes("503")) {
        errorHint = "The AI model is currently overloaded.";
      }

      const errorMessage =
        `**LIBRARIAN ERROR:** The Librarian crashed while fetching data.\n\n` +
        `**Details:** ${detailedError}\n` +
        `**Hint:** ${errorHint || "Check your API connection."}`;

      yield {
        candidates: [
          {
            content: {
              parts: [{ text: errorMessage }],
              role: "model",
            },
          },
        ],
        text: errorMessage,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let toolCalls: any[] = [];

    for await (const chunk of stream) {
      yield chunk;
      const calls = chunk.candidates?.[0]?.content?.parts?.filter(
        (p) => p.functionCall,
      );
      if (calls && calls.length > 0) {
        toolCalls = calls.map((p) => p.functionCall);
      }
    }

    if (toolCalls.length > 0) {
      console.log(
        `[Librarian] executing ${toolCalls.length} tools. Turn: ${turnCount}`,
      );

      const functionResponses = [];
      for (const call of toolCalls) {
        let result = "";

        // HANDLER: GitHub Docs
        if (call.name === "get_framework_docs") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { framework, module_name, branch } = call.args as any;
          const fingerprint =
            `${framework}:${module_name}:${branch || ""}`.toUpperCase();

          if (toolCallHistory.has(fingerprint)) {
            console.warn(
              `[Librarian] Duplicate tool call blocked: ${fingerprint}`,
            );
            result =
              "SYSTEM ALERT: You have already fetched this module. Do not fetch it again. Use the data previously provided.";
          } else {
            toolCallHistory.add(fingerprint);
            result = await getFrameworkDocs(framework, module_name, branch);
          }
        }
        // HANDLER: SSE Hard Deck
        else if (call.name === "get_sse_docs") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { category } = call.args as any;
          const fingerprint = `SSE:${category}`;

          if (toolCallHistory.has(fingerprint)) {
            result =
              "SYSTEM ALERT: SSE Definitions for this category are already in context.";
          } else {
            toolCallHistory.add(fingerprint);
            if (category === "All") {
              result = JSON.stringify(SSE_DEFINITIONS, null, 2);
            } else if (SSE_DEFINITIONS[category]) {
              result = JSON.stringify(SSE_DEFINITIONS[category], null, 2);
            } else {
              result =
                "ERROR: Category not found in Hard Deck. Available: Group, Unit, timer, trigger, coalition.";
            }
          }
        }

        functionResponses.push({
          id: call.id,
          name: call.name,
          response: { result: result },
        });
      }

      if (functionResponses.length > 0) {
        currentTurnMessage = functionResponses.map((fr) => ({
          functionResponse: fr,
        }));
        continue;
      }
    }

    break;
  }
}
