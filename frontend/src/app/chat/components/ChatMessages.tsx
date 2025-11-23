import { Message } from "../types";
import { ChatMessage } from "./ChatMessage";
import { ThinkingIndicator } from "./ThinkingIndicator";

type ChatMessagesProps = {
  messages: Message[];
  isLoading: boolean;
};

export const ChatMessages = ({ messages, isLoading }: ChatMessagesProps) => {
  if (messages.length === 0) return null;

  return (
    <div className="w-full mb-6">
      {messages.map((message) => (
        <ChatMessage key={message.id || Math.random()} message={message} />
      ))}
      {isLoading && <ThinkingIndicator />}
    </div>
  );
};

