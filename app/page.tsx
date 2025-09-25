"use client";

import { MelonyProvider } from "melony";
import Chat from "@/components/chat";
import Canvas from "@/components/canvas";

export default function MelonyHome() {
  return (
    <MelonyProvider>
      <div className="h-screen w-full flex gap-2">
        <div className="flex flex-col h-full w-4/12">
          <Chat />
        </div>
        <div className="flex flex-col h-full w-8/12 p-2">
          <Canvas />
        </div>
      </div>
    </MelonyProvider>
  );
}
