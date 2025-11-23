"use client";

import { useState } from "react";

type ChatInputProps = {
  onSend: (message: string) => void;
  placeholder: string;
  disabled?: boolean;
};

export const ChatInput = ({ onSend, placeholder, disabled = false }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex items-center gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="flex-1 px-6 py-4 text-lg text-white placeholder:text-white/60 border-2 border-white rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all"
        disabled={disabled}
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className="w-14 h-14 rounded-full bg-white text-[#1b98d5] flex items-center justify-center hover:bg-white/90 transition-all focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        aria-label="Send"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
        </svg>
      </button>
    </div>
  );
};

