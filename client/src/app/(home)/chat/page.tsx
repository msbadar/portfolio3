"use client";

import { AppProvider } from "@/context/AppContext";
import { AppContent } from "@/components/AppContent";
import { ChatPage } from "@/components/ChatPage";

export default function Chat() {
  return (
    <AppProvider>
      <AppContent>
        <ChatPage />
      </AppContent>
    </AppProvider>
  );
}
