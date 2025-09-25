import {
  Conversation,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { ConversationContent } from "@/components/ai-elements/conversation";
import ChatMessage from "./chat-message";
import { useMelonyMessages, useMelonyStatus } from "melony";
import { Bot } from "lucide-react";
import { Loader } from "@/components/ai-elements/loader";
import { UIMessageChunk } from "ai";

export type ChatMessagePartType =
  | (UIMessageChunk & {
      melonyId: string;
      role: "user" | "assistant";
    })
  | {
      type: "text";
      text: string;
      melonyId: string;
      role: "user" | "assistant";
    };

export const ChatMessages = () => {
  const messages = useMelonyMessages<ChatMessagePartType>();
  const status = useMelonyStatus();
  const isTyping = status === "streaming" || status === "requested";

  return (
    <Conversation>
      <ConversationContent className="max-w-4xl mx-auto px-4 md:px-8">
        {messages.length === 0 ? (
          <ConversationEmptyState
            title="Welcome to AI Chat"
            description="Start a conversation by typing a message below. I'm here to help with any questions you might have!"
            icon={<Bot className="h-8 w-8 text-muted-foreground" />}
          />
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}

        {isTyping && <Loader size={16} />}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
};
