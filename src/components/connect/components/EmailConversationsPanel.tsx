
import { EmailInterfaceHeader } from "./EmailInterfaceHeader";
import { EmailConversationsList } from "./EmailConversationsList";

interface EmailConversation {
  id: string;
  subject: string;
  last_message_at: string;
  status: string;
  client_id?: string;
  client?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  emails: any[];
}

interface EmailConversationsPanelProps {
  conversations: EmailConversation[];
  selectedConversation: EmailConversation | null;
  onConversationSelect: (conversation: EmailConversation) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isLoading: boolean;
  onRefresh: () => void;
  onNewEmail: () => void;
  filteredConversations: EmailConversation[];
}

export const EmailConversationsPanel = ({
  conversations,
  selectedConversation,
  onConversationSelect,
  searchTerm,
  onSearchChange,
  isLoading,
  onRefresh,
  onNewEmail,
  filteredConversations
}: EmailConversationsPanelProps) => {
  return (
    <div className="h-full flex flex-col">
      <EmailInterfaceHeader
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onRefresh={onRefresh}
        onNewEmail={onNewEmail}
        isLoading={isLoading}
      />

      <div className="flex-1">
        <EmailConversationsList
          conversations={searchTerm ? filteredConversations : conversations}
          selectedConversation={selectedConversation}
          onConversationSelect={onConversationSelect}
          isLoading={isLoading}
          onRefresh={onRefresh}
          onNewEmail={onNewEmail}
        />
      </div>
    </div>
  );
};
