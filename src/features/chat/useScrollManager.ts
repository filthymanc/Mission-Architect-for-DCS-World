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

import { useRef, useState, useEffect } from "react";

export const useScrollManager = (dependency: unknown, isLoading: boolean) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  // Auto-Scroll Effect
  useEffect(() => {
    if (autoScrollEnabled && messagesEndRef.current) {
      // Use 'auto' (instant) if loading to prevent 'smooth' scroll lag from locking the UI
      const behavior = isLoading ? "auto" : "smooth";
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, [dependency, autoScrollEnabled, isLoading]);

  // Scroll Event Handler to detect user scrolling up
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollContainerRef.current;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;

      const stickThreshold = 100; // Distance to re-engage lock
      const breakThreshold = 200; // Distance to break lock

      const isAtBottom = distanceToBottom <= stickThreshold;

      if (isAtBottom && !autoScrollEnabled) {
        setAutoScrollEnabled(true);
      } else if (distanceToBottom > breakThreshold && autoScrollEnabled) {
        setAutoScrollEnabled(false);
      }
    }
  };

  const scrollToBottom = () => {
    setAutoScrollEnabled(true);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, 50);
  };

  return {
    messagesEndRef,
    scrollContainerRef,
    autoScrollEnabled,
    handleScroll,
    scrollToBottom,
  };
};
