import { useState } from "react";
import { Message, BackendResponse, ChatMode } from "../types";
import { sendMessageToBackend } from "../services/api";

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("initial");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = { 
      role: "user", 
      content: content.trim(),
      timestamp: new Date(),
      id: `msg-${Date.now()}-user`,
      isNew: true
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response: BackendResponse = await sendMessageToBackend(content.trim());

      // Add assistant response with typing animation
      const assistantMessage: Message = {
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
        id: `msg-${Date.now()}-assistant`,
        isNew: true // Mark as new for typing animation
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Update chat mode based on response
      if (response.code === "refine") {
        setChatMode("refining");
      } else if (response.code === "finish") {
        // Start transition sequence for results
        setIsTransitioning(true);
        setTimeout(() => {
          setChatMode("finished");
          setIsTransitioning(false);
        }, 3000); // Show loading for 3 seconds
      }

      console.log("Backend response code:", response.code);

      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    chatMode,
    isTransitioning,
    sendMessage,
  };
};

