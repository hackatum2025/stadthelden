import { useState, useEffect } from "react";
import { Message, BackendResponse, ChatMode } from "../types";
import { sendMessageToBackend } from "../services/api";
import { useSession } from "../context/SessionContext";

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("initial");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { chatMessages: sessionMessages, foundationResults, setChatMessages, setProjectQuery } = useSession();
  const [hasRestoredSession, setHasRestoredSession] = useState(false);

  // Restore session data when sessionMessages become available
  useEffect(() => {
    // Only restore if we have session messages and haven't restored them yet
    if (sessionMessages.length > 0 && !hasRestoredSession) {
      console.log("🔄 Restoring UI state from session:", {
        messages: sessionMessages.length,
        foundationResults: foundationResults.length
      });
      
      // Restore existing session
      const restoredMessages: Message[] = sessionMessages.map((msg, idx) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
        timestamp: new Date(msg.timestamp || new Date()),
        id: `msg-restored-${idx}`,
        isNew: false
      }));
      
      setMessages(restoredMessages);
      
      // Determine chat mode based on session state
      if (foundationResults.length > 0) {
        console.log("✅ Restoring to FINISHED mode with results");
        setChatMode("finished");
      } else if (restoredMessages.length > 0) {
        // Check if last message indicates refining mode
        const lastMessage = restoredMessages[restoredMessages.length - 1];
        if (lastMessage.role === "assistant") {
          console.log("✅ Restoring to REFINING mode");
          setChatMode("refining");
        }
      }
      
      setHasRestoredSession(true);
      console.log("✅ Session UI restored:", restoredMessages.length, "messages");
    }
  }, [sessionMessages, foundationResults, hasRestoredSession]);

  // Save messages to session context whenever they change
  // But don't save if we just restored them (to avoid overwriting on initial load)
  useEffect(() => {
    // Only save if:
    // 1. We have messages
    // 2. Either we haven't restored a session, or we have but these are new messages
    if (messages.length > 0) {
      // Check if these are newly added messages (not restored ones)
      const hasNewMessages = messages.some(msg => msg.isNew);
      const shouldSave = !hasRestoredSession || hasNewMessages;
      
      if (shouldSave) {
        const sessionMsgs = messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: (msg.timestamp || new Date()).toISOString(),
        }));
        console.log("💾 Saving", sessionMsgs.length, "messages to session context");
        setChatMessages(sessionMsgs);
        
        // Save first user message as project query
        const firstUserMessage = messages.find(m => m.role === "user");
        if (firstUserMessage) {
          setProjectQuery(firstUserMessage.content);
        }
      }
    }
  }, [messages, hasRestoredSession, setChatMessages, setProjectQuery]);

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

