import { BackendResponse } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Real backend call
export const sendMessageToBackend = async (
  message: string,
  conversationId?: string
): Promise<BackendResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        content: message
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error calling backend:", error);
    // Fallback to mock response if backend is unavailable
    return mockBackendCall(message);
  }
};

// Mock backend call - fallback when backend is unavailable
export const mockBackendCall = async (
  userMessage: string
): Promise<BackendResponse> => {
  console.log("⚠️ Using mock backend - real backend unavailable");
  
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock logic: if message is too short, ask for refinement
  if (userMessage.length < 20) {
    return {
      code: "refine",
      message:
        "Could you please provide more details about how you'd like to help? The more specific you are, the better we can assist you!",
    };
  }

  // Otherwise, finish
  return {
    code: "finish",
    message:
      "Thank you for your contribution! We've recorded your idea and will get back to you soon.",
  };
};

// Get all foundations from backend
export const getFoundations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/foundations`);
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching foundations:", error);
    return null;
  }
};

// Get foundations with match scores
export const getFoundationScores = async (query?: string, limit: number = 5) => {
  try {
    const params = new URLSearchParams();
    if (query) params.append("query", query);
    params.append("limit", limit.toString());
    
    const response = await fetch(
      `${API_BASE_URL}/api/v1/foundations/scores?${params.toString()}`
    );
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching foundation scores:", error);
    return null;
  }
};

// Session Management APIs
export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export type SessionData = {
  chat_messages: ChatMessage[];
  foundation_results: any[];
  current_foundation_id?: string;
  project_query?: string;
};

export type SessionResponse = {
  success: boolean;
  session_id: string;
  data?: {
    session_id: string;
    chat_messages: ChatMessage[];
    foundation_results: any[];
    current_foundation_id?: string;
    project_query?: string;
    created_at: string;
    updated_at: string;
  };
  message?: string;
};

// Create a new session
export const createSession = async (data: SessionData): Promise<SessionResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error creating session:", error);
    return null;
  }
};

// Update an existing session
export const updateSession = async (
  sessionId: string,
  data: SessionData
): Promise<SessionResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/sessions/${sessionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating session:", error);
    return null;
  }
};

// Get a session by ID
export const getSession = async (sessionId: string): Promise<SessionResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/sessions/${sessionId}`);
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching session:", error);
    return null;
  }
};

// Delete a session
export const deleteSession = async (sessionId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/sessions/${sessionId}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting session:", error);
    return false;
  }
};

// List recent sessions
export type SessionListItem = {
  session_id: string;
  project_query?: string;
  created_at: string;
  updated_at: string;
  chat_messages: ChatMessage[];
};

export type SessionListResponse = {
  success: boolean;
  count: number;
  sessions: SessionListItem[];
};

export const listRecentSessions = async (limit: number = 3): Promise<SessionListResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/sessions?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error listing sessions:", error);
    return null;
  }
};

// Document Generation APIs
export type RequiredDocumentInput = {
  document_type: string;
  description: string;
  required: boolean;
};

export type GenerateDocumentsRequest = {
  required_documents: RequiredDocumentInput[];
  chat_messages: ChatMessage[];
  project_query?: string;
  foundation_name?: string;
  foundation_details?: any;
};

export type GeneratedDocument = {
  document: string;  // document_type
  text: string;      // generated content
  improvements?: string[];  // list of improvement suggestions
};

export type GenerateDocumentsResponse = {
  success: boolean;
  documents: GeneratedDocument[];
  message?: string;
};

// Generate document content based on context
export const generateDocuments = async (
  request: GenerateDocumentsRequest
): Promise<GenerateDocumentsResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error generating documents:", error);
    return null;
  }
};

// Proofread document and get improvement suggestions
export type ProofreadDocumentRequest = {
  document_text: string;
  document_type: string;
  existing_improvements?: string[];
};

export type ProofreadDocumentResponse = {
  success: boolean;
  improvements: string[];
  message?: string;
};

export const proofreadDocument = async (
  request: ProofreadDocumentRequest
): Promise<ProofreadDocumentResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/proofread`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error proofreading document:", error);
    return null;
  }
};

