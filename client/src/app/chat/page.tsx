import { AppProvider } from "@/context/AppContext";
import { AvatarMenu } from "@/components/AvatarMenu";
import { ChatPage } from "@/components/ChatPage";
import { ComposeModal } from "@/components/ComposeModal";

export default function Chat() {
  return (
    <AppProvider>
      <div className="flex h-screen bg-[var(--background)] font-sans text-[var(--foreground)]">
        <AvatarMenu />
        <div className="flex-1 max-w-5xl mx-auto w-full h-full">
          <ChatPage />
        </div>
        <ComposeModal />
      </div>
    </AppProvider>
  );
}
