import { useMelonySend } from "melony";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit,
  PromptInputTools,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
} from "@/components/ai-elements/prompt-input";
import { useState } from "react";

export default function ChatUserInput() {
  const [message, setMessage] = useState("");
  const send = useMelonySend();

  const handleSubmit = (message: { text?: string; files?: any[] }) => {
    if (message.text) {
      send(message.text);
      setMessage("");
    }
  };

  return (
    <PromptInput onSubmit={handleSubmit}>
      <PromptInputBody>
        <PromptInputTextarea
          placeholder="Ask me anything..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <PromptInputToolbar>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                {/* Add any action menu items here */}
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
          </PromptInputTools>
          <PromptInputSubmit />
        </PromptInputToolbar>
      </PromptInputBody>
    </PromptInput>
  );
}
