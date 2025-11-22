"use client";

import Image from "next/image";
import { useTypingAnimation } from "./hooks/useTypingAnimation";
import { useChat } from "./hooks/useChat";
import { HeroSection } from "./components/HeroSection";
import { ChatMessages } from "./components/ChatMessages";
import { ChatInput } from "./components/ChatInput";
import { RefiningMode } from "./components/RefiningMode";
import { ResultsView } from "./components/ResultsView";
import { ProjectAnalysisLoader } from "./components/ProjectAnalysisLoader";
import { useSession } from "./context/SessionContext";

export default function ChatPage() {
  const placeholder = useTypingAnimation(
    "How do you want to help? Tell us your idea...",
    100
  );
  const { messages, isLoading, chatMode, isTransitioning, sendMessage } = useChat();
  const { clearSession, sessionId } = useSession();

  const handleNewChat = () => {
    clearSession();
    window.location.reload();
  };

  const showHero = messages.length === 0;
  const showRefiningBanner = chatMode === "refining" && messages.length > 0;
  const showResults = chatMode === "finished" && !isTransitioning;
  const showSplitView = showResults || isTransitioning;
  const hasRestoredSession = sessionId && messages.length > 0;

  return (
    <div className="flex h-screen bg-[#1b98d5] transition-all duration-[2000ms] relative">
      {/* Results Section - Left Side */}
      <div 
        className={`transition-all duration-[2000ms] ease-in-out ${
          showSplitView ? 'w-[70%] opacity-100' : 'w-0 opacity-0'
        } overflow-hidden`}
      >
        {isTransitioning ? (
          <ProjectAnalysisLoader />
        ) : showResults ? (
          <ResultsView />
        ) : null}
      </div>

      {/* Chat Section - Transitions from center to right */}
      <div 
        className={`flex flex-col transition-all duration-[2000ms] ease-in-out bg-[#1b98d5] ${
          showSplitView 
            ? 'w-[30%] border-l-2 border-white/30' 
            : 'w-full'
        }`}
      >
        {/* Header Bar - Only shown in split view */}
        {showSplitView && (
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/20 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-white mb-0.5">Chat</h2>
              <p className="text-xs text-white/80">
                Ich habe deine Projektidee analysiert
              </p>
            </div>
            {sessionId && (
              <button
                onClick={handleNewChat}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm font-medium cursor-pointer group"
              >
                <svg className="w-4 h-4 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Neu
              </button>
            )}
          </div>
        )}

        {/* New Chat Button - Centered when not in split view */}
        {!showSplitView && sessionId && messages.length > 0 && (
          <div className="absolute top-6 right-6 z-50">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#1b98d5] rounded-lg hover:shadow-lg transition-all font-medium cursor-pointer group"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Neuer Chat
            </button>
          </div>
        )}
        {/* Main chat area */}
        <main className={`flex flex-1 items-center justify-center transition-all duration-[2000ms] overflow-hidden ${
          showSplitView ? 'px-2 py-2' : 'px-4 py-8'
        }`}>
          <div 
            className={`flex flex-col w-full h-full transition-all duration-[1500ms] ${
              showSplitView ? 'max-w-full' : 'max-w-4xl'
            } ${
              showHero ? "justify-center items-center" : "justify-end"
            }`}
          >
            {/* Hero Section - only show when no messages */}
            {showHero && !showSplitView && (
              <div className="animate-fadeIn">
                <HeroSection />
              </div>
            )}

            {/* Refining Mode Banner */}
            {showRefiningBanner && (
              <div className="animate-slideDown">
                <RefiningMode />
              </div>
            )}

            {/* Chat Messages */}
            <div className={`w-full flex-1 transition-all duration-[2000ms] ${
              showSplitView ? 'px-2 overflow-y-auto' : 'px-4'
            } ${messages.length > 0 ? 'animate-fadeIn' : ''}`}>
              <ChatMessages messages={messages} isLoading={isLoading} />
            </div>

            {/* Input with Send Button */}
            <div className={`w-full transition-all duration-[2000ms] ${
              showSplitView ? 'px-2 mt-2' : 'px-4'
            }`}>
              <ChatInput
                onSend={sendMessage}
                placeholder={placeholder}
                disabled={isLoading}
              />
            </div>
          </div>
        </main>

        {/* München Logo in lower left corner - only in full view */}
        {!showSplitView && (
          <div className="fixed bottom-6 left-6 z-10 transition-opacity duration-[2000ms]">
            <Image
              src="/logo.svg"
              alt="München Logo"
              width={200}
              height={40}
              priority
            />
          </div>
        )}
      </div>
    </div>
  );
}
