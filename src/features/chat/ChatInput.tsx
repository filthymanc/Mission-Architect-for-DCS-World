import React, { useState, useRef, useEffect } from "react";
import { SendIcon } from "../../shared/ui/Icons";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isGenerating: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onStop,
  isGenerating,
  placeholder = "Instruct the Architect... (Ctrl+Enter to send)",
}) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight for shrinking
      textareaRef.current.style.height = "auto";
      // Set height to scrollHeight to expand
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
    // Height reset handled by useEffect when input becomes empty
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto relative">
      <div className="relative w-full bg-app-surface border border-app-border rounded-xl shadow-sm focus-within:ring-1 focus-within:ring-app-brand focus-within:border-app-brand transition-all overflow-hidden">
        <textarea
          ref={textareaRef}
          id="chat-input"
          name="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isGenerating}
          className="w-full bg-transparent border-none focus:ring-0 focus:outline-none resize-none pl-4 pr-14 py-3.5 text-sm custom-scrollbar disabled:opacity-50 disabled:cursor-not-allowed overflow-y-auto rounded-xl"
          rows={1}
          style={{ minHeight: "52px", maxHeight: "150px" }}
        />

        <div className="absolute right-2 bottom-2">
          {isGenerating ? (
            <button
              onClick={onStop}
              className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
              title="Stop Generation"
            >
              <div className="w-4 h-4 rounded-sm bg-current" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2 bg-app-brand text-white rounded-lg hover:bg-opacity-90 disabled:bg-app-border disabled:text-app-tertiary transition-all shadow-lg shadow-app-brand/20 disabled:shadow-none"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
