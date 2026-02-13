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

/**
 * DCS Standard Scripting Engine (SSE) Hard Deck
 * Version: v2.5.0
 *
 * This file contains Functional Specifications (Type Definitions) for the core DCS classes.
 * It serves as a "Hard Deck" to prevent the AI from hallucinating methods that do not exist.
 *
 * ATTRIBUTION:
 * Knowledge derived from the community efforts at https://wiki.hoggitworld.com
 * Content is strictly limited to Functional Signatures (Input/Output) to comply with copyright protocols.
 */

export interface SSEDefinition {
  name: string;
  description: string;
  signatures: string[];
}

export const SSE_DEFINITIONS: Record<string, SSEDefinition[]> = {
  Group: [
    {
      name: "Group.getByName",
      description:
        "Returns the Group object associated with the provided name string. Returns nil if not found.",
      signatures: ["Group.getByName(name: string): Group | nil"],
    },
    {
      name: "Group.getUnits",
      description: "Returns an array of Unit objects belonging to the group.",
      signatures: ["Group:getUnits(): Unit[]"],
    },
    {
      name: "Group.destroy",
      description: "Destroys the group and all of its units from the mission.",
      signatures: ["Group:destroy(): void"],
    },
    {
      name: "Group.activate",
      description:
        "Activates a group that was set to 'Late Activation' in the Mission Editor.",
      signatures: ["Group:activate(): void"],
    },
    {
      name: "Group.getID",
      description: "Returns the unique numeric ID of the group.",
      signatures: ["Group:getID(): number"],
    },
    {
      name: "Group.getName",
      description: "Returns the string name of the group.",
      signatures: ["Group:getName(): string"],
    },
    {
      name: "Group.getSize",
      description: "Returns the number of units currently alive in the group.",
      signatures: ["Group:getSize(): number"],
    },
    {
      name: "Group.getUnit",
      description: "Returns the Unit object at the specified index (1-based).",
      signatures: ["Group:getUnit(index: number): Unit | nil"],
    },
  ],
  Unit: [
    {
      name: "Unit.getByName",
      description:
        "Returns the Unit object associated with the provided name string. Returns nil if not found.",
      signatures: ["Unit.getByName(name: string): Unit | nil"],
    },
    {
      name: "Unit.isActive",
      description:
        "Returns true if the unit is active (spawned and not destroyed).",
      signatures: ["Unit:isActive(): boolean"],
    },
    {
      name: "Unit.getPoint",
      description: "Returns the current 3D position (Vec3) of the unit.",
      signatures: ["Unit:getPoint(): Vec3"],
    },
    {
      name: "Unit.getGroup",
      description: "Returns the parent Group object of the unit.",
      signatures: ["Unit:getGroup(): Group"],
    },
    {
      name: "Unit.getLife",
      description: "Returns the current health of the unit.",
      signatures: ["Unit:getLife(): number"],
    },
    {
      name: "Unit.destroy",
      description: "Destroys the unit instance.",
      signatures: ["Unit:destroy(): void"],
    },
  ],
  timer: [
    {
      name: "timer.scheduleFunction",
      description:
        "Schedules a function to run at a specific future time. Crucial for loops.",
      signatures: [
        "timer.scheduleFunction(functionToCall, functionArg, time: number): number",
      ],
    },
    {
      name: "timer.getTime",
      description:
        "Returns the current mission time in seconds relative to mission start.",
      signatures: ["timer.getTime(): number"],
    },
    {
      name: "timer.getAbsTime",
      description:
        "Returns the absolute time in seconds (including day/month offsets).",
      signatures: ["timer.getAbsTime(): number"],
    },
  ],
  trigger: [
    {
      name: "trigger.action.outText",
      description: "Displays a text message on screen to all players.",
      signatures: [
        "trigger.action.outText(text: string, delay: number, clearView?: boolean): void",
      ],
    },
    {
      name: "trigger.action.outSound",
      description: "Plays a sound file to all players.",
      signatures: ["trigger.action.outSound(soundFile: string): void"],
    },
    {
      name: "trigger.misc.getUserFlag",
      description: "Returns the value of a user flag.",
      signatures: ["trigger.misc.getUserFlag(flagName: string): number"],
    },
    {
      name: "trigger.action.setUserFlag",
      description: "Sets the value of a user flag.",
      signatures: [
        "trigger.action.setUserFlag(flagName: string, value: number | boolean): void",
      ],
    },
  ],
};
