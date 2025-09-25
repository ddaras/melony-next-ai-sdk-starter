import ChatUserInput from "./chat-user-input";
import { ChatMessages } from "./chat-messages";

export default function Chat() {
  return (
    <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
      <ChatMessages />

      <div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
        <ChatUserInput />
      </div>
    </div>
  );
}
