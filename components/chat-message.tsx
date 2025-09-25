import { MelonyMessage } from "melony";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import WeatherCard from "@/components/weather";

import { ChatMessagePartType } from "./chat-messages";

function getToolOutputById(parts: ChatMessagePartType[], toolCallId: string) {
  return parts
    ?.filter((part) => part.type === "tool-output-available")
    ?.find((part) => part.toolCallId === toolCallId)?.output;
}

function renderAssistantParts(parts: ChatMessagePartType[]) {
  if (!parts) return null;

  return parts.map((part, idx) => {
    if (part.type === "text") {
      return <Response key={`user-text-${idx}`}>{part.text || ""}</Response>;
    }

    if (part.type === "tool-input-available" && part.toolName === "weather") {
      const toolCallId = (part as any).toolCallId as string;
      const toolOutput: any = getToolOutputById(parts, toolCallId);
      if (!toolOutput) {
        return <div key={`${toolCallId}-loading`}>Loading tool output...</div>;
      }
      return (
        <WeatherCard
          key={toolCallId}
          location={(part as any).input?.location}
          weather={toolOutput?.weather}
        />
      );
    }

    return null;
  });
}

function renderUserParts(parts: ChatMessagePartType[]) {
  if (!parts) return null;
  return parts.map((part, idx) => {
    if (part.type === "text") {
      return <Response key={`user-text-${idx}`}>{part.text || ""}</Response>;
    }
    return null;
  });
}

export default function ChatMessage({
  message,
}: {
  message: MelonyMessage<ChatMessagePartType>;
}) {
  if (message.role === "user") {
    return (
      <Message from="user">
        <MessageContent>{renderUserParts(message.parts)}</MessageContent>
      </Message>
    );
  }

  return (
    <Message from="assistant">
      <MessageContent className="!bg-transparent p-0">
        {renderAssistantParts(message.parts)}
      </MessageContent>
    </Message>
  );
}
