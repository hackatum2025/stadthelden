"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { 
  createSession, 
  updateSession, 
  getSession, 
  type SessionData,
  type SessionResponse,
  type ChatMessage,
  type ApplicationDocument
} from "../services/api";

type SessionContextType = {
  sessionId: string | null;
  chatMessages: ChatMessage[];
  foundationResults: any[];
  projectQuery: string | null;
  currentFoundationId: string | null;
  applicationDocuments: Record<string, ApplicationDocument[]>;
  
  // Actions
  setChatMessages: (messages: ChatMessage[]) => void;
  setFoundationResults: (results: any[]) => void;
  setProjectQuery: (query: string) => void;
  setCurrentFoundationId: (id: string | null) => void;
  saveSession: () => Promise<void>;
  loadSession: (sessionId: string, shouldNavigate?: boolean) => Promise<void>;
  clearSession: () => void;
  ensureSession: () => Promise<string>; // New: ensure session exists before chat
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

type SessionProviderProps = {
  children: ReactNode;
};

export const SessionProvider = ({ children }: SessionProviderProps) => {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [foundationResults, setFoundationResults] = useState<any[]>([]);
  const [projectQuery, setProjectQuery] = useState<string | null>(null);
  const [currentFoundationId, setCurrentFoundationId] = useState<string | null>(null);
  const [applicationDocuments, setApplicationDocuments] = useState<Record<string, ApplicationDocument[]>>({});

  // Check if session has application documents
  const hasApplicationDocuments = (data: SessionResponse['data']): boolean => {
    if (!data || !data.application_documents) return false;
    const docs = data.application_documents;
    return Object.keys(docs).length > 0 && 
           Object.values(docs).some(docList => docList && docList.length > 0);
  };

  // Get the first foundation ID with application documents
  const getFirstFoundationId = (data: SessionResponse['data']): string | null => {
    if (!data || !data.application_documents) return null;
    const foundationIds = Object.keys(data.application_documents);
    if (foundationIds.length > 0) {
      const firstId = foundationIds[0];
      const docs = data.application_documents[firstId];
      if (docs && docs.length > 0) {
        return firstId;
      }
    }
    return data.current_foundation_id || null;
  };

  // Load session from backend
  const loadSession = useCallback(async (id: string, shouldNavigate: boolean = false) => {
    try {
      console.log("🔄 Loading session from backend:", id);
      const response = await getSession(id);
      if (response?.success && response.data) {
        console.log("📦 Session data received:", {
          messages: response.data.chat_messages.length,
          results: response.data.foundation_results.length,
          query: response.data.project_query,
          foundationId: response.data.current_foundation_id,
          hasApplicationDocs: hasApplicationDocuments(response.data)
        });
        
        setChatMessages(response.data.chat_messages);
        setFoundationResults(response.data.foundation_results);
        setProjectQuery(response.data.project_query || null);
        setCurrentFoundationId(response.data.current_foundation_id || null);
        setApplicationDocuments(response.data.application_documents || {});
        setSessionId(id);
        
        // If session has application documents and we should navigate, go to application page
        if (shouldNavigate && hasApplicationDocuments(response.data)) {
          const foundationId = getFirstFoundationId(response.data);
          if (foundationId) {
            console.log("📄 Session has application documents, navigating to application page");
            router.push(`/application/${foundationId}`);
            return;
          }
        }
        
        console.log("✅ Session loaded successfully:", id);
      } else {
        console.warn("⚠️ Session not found or invalid response");
      }
    } catch (error) {
      console.error("❌ Error loading session:", error);
    }
  }, [router]);

  // Save session to backend and localStorage
  const saveSession = useCallback(async () => {
    const sessionData: SessionData = {
      chat_messages: chatMessages,
      foundation_results: foundationResults,
      current_foundation_id: currentFoundationId || undefined,
      project_query: projectQuery || undefined,
      application_documents: applicationDocuments,
    };

    console.log("💾 Saving session with data:", {
      messages: chatMessages.length,
      results: foundationResults.length,
      query: projectQuery,
      foundationId: currentFoundationId,
      applicationDocs: Object.keys(applicationDocuments).length
    });

    try {
      if (sessionId) {
        // Update existing session
        const response = await updateSession(sessionId, sessionData);
        if (response?.success) {
          console.log("✅ Session updated:", response.session_id);
        }
      } else {
        // Create new session
        const response = await createSession(sessionData);
        if (response?.success) {
          setSessionId(response.session_id);
          localStorage.setItem("sessionId", response.session_id);
          console.log("✅ Session created:", response.session_id);
        }
      }
    } catch (error) {
      console.error("❌ Error saving session:", error);
    }
  }, [sessionId, chatMessages, foundationResults, currentFoundationId, projectQuery, applicationDocuments]);

  // Load session ID from localStorage on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem("sessionId");
    if (storedSessionId) {
      console.log("🔄 Loading session from localStorage:", storedSessionId);
      // Pass shouldNavigate=true to automatically navigate to application page if it has documents
      loadSession(storedSessionId, true);
    }
  }, [loadSession]);

  // Ensure session exists (create if needed) - returns session ID
  const ensureSession = useCallback(async (): Promise<string> => {
    if (sessionId) {
      console.log("✅ Using existing session:", sessionId);
      return sessionId;
    }

    console.log("📝 Creating new session before sending message...");
    const sessionData: SessionData = {
      chat_messages: [],
      foundation_results: [],
      current_foundation_id: undefined,
      project_query: undefined,
    };

    try {
      const response = await createSession(sessionData);
      if (response?.success) {
        setSessionId(response.session_id);
        localStorage.setItem("sessionId", response.session_id);
        console.log("✅ New session created:", response.session_id);
        return response.session_id;
      } else {
        throw new Error("Failed to create session");
      }
    } catch (error) {
      console.error("❌ Error creating session:", error);
      throw error;
    }
  }, [sessionId]);

  // Clear session
  const clearSession = useCallback(() => {
    setSessionId(null);
    setChatMessages([]);
    setFoundationResults([]);
    setProjectQuery(null);
    setCurrentFoundationId(null);
    setApplicationDocuments({});
    localStorage.removeItem("sessionId");
  }, []);

  // Auto-save when data changes
  useEffect(() => {
    if (chatMessages.length > 0 || foundationResults.length > 0) {
      const timeoutId = setTimeout(() => {
        saveSession();
      }, 1000); // Debounce saves by 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [chatMessages, foundationResults, projectQuery, currentFoundationId, saveSession]);

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        chatMessages,
        foundationResults,
        projectQuery,
        currentFoundationId,
        applicationDocuments,
        setChatMessages,
        setFoundationResults,
        setProjectQuery,
        setCurrentFoundationId,
        saveSession,
        loadSession,
        clearSession,
        ensureSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

