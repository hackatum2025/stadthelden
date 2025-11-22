"use client";

import { useState, useEffect, useRef } from "react";
import { listRecentSessions, type SessionListItem } from "../services/api";
import { useSession } from "../context/SessionContext";

type SessionSelectorProps = {
  disabled?: boolean;
};

export const SessionSelector = ({ disabled }: SessionSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { sessionId: currentSessionId, loadSession } = useSession();

  // Load sessions when dropdown opens
  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const response = await listRecentSessions(3);
      if (response?.success) {
        setSessions(response.sessions);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSession = async (session: SessionListItem) => {
    if (session.session_id === currentSessionId) {
      setIsOpen(false);
      return;
    }

    console.log("🔄 Switching to session:", session.session_id);
    setLoadingSessionId(session.session_id);

    try {
      // Update localStorage with the new session ID
      localStorage.setItem("sessionId", session.session_id);
      
      // Load the session data
      await loadSession(session.session_id);
      
      setIsOpen(false);
      
      // Reload to trigger full UI restoration
      console.log("♻️ Reloading page to restore session state");
      window.location.reload();
    } catch (error) {
      console.error("❌ Error switching session:", error);
      setLoadingSessionId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Gerade eben";
    if (diffMins < 60) return `Vor ${diffMins} Min.`;
    if (diffHours < 24) return `Vor ${diffHours} Std.`;
    if (diffDays < 7) return `Vor ${diffDays} Tag${diffDays > 1 ? "en" : ""}`;
    
    return date.toLocaleDateString("de-DE", { 
      day: "2-digit", 
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    });
  };

  const getSessionPreview = (session: SessionListItem) => {
    if (session.project_query) {
      return session.project_query.length > 50 
        ? session.project_query.substring(0, 50) + "..." 
        : session.project_query;
    }
    if (session.chat_messages.length > 0) {
      const firstUserMsg = session.chat_messages.find(m => m.role === "user");
      if (firstUserMsg) {
        return firstUserMsg.content.length > 50
          ? firstUserMsg.content.substring(0, 50) + "..."
          : firstUserMsg.content;
      }
    }
    return "Neue Sitzung";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="p-3 text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Vergangene Sitzungen"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Vergangene Sitzungen</h3>
          </div>

          {/* Sessions List */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b98d5] mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Lade Sitzungen</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-sm text-gray-500">Keine gespeicherten Sitzungen</p>
              </div>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.session_id}
                  onClick={() => handleSelectSession(session)}
                  disabled={loadingSessionId === session.session_id}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 disabled:opacity-50 disabled:cursor-wait ${
                    session.session_id === currentSessionId ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium truncate">
                        {getSessionPreview(session)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(session.updated_at)}
                      </p>
                    </div>
                    {loadingSessionId === session.session_id ? (
                      <div className="flex-shrink-0">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1b98d5]"></div>
                      </div>
                    ) : session.session_id === currentSessionId ? (
                      <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Aktiv
                      </span>
                    ) : null}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

