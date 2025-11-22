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
        message,
        conversation_id: conversationId 
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

