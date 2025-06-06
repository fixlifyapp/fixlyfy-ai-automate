
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Mail, Plus, RefreshCw } from "lucide-react";

interface EmailInterfaceHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onNewEmail: () => void;
  isLoading: boolean;
}

export const EmailInterfaceHeader = ({
  searchTerm,
  onSearchChange,
  onRefresh,
  onNewEmail,
  isLoading
}: EmailInterfaceHeaderProps) => {
  return (
    <div className="p-4 border-b border-fixlyfy-border bg-gradient-to-r from-fixlyfy/5 to-fixlyfy-light/5">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-primary rounded-lg">
          <Mail className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-fixlyfy-text">Email Conversations</h2>
      </div>
      
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fixlyfy-text-muted h-4 w-4" />
        <Input
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 border-fixlyfy-border focus:ring-2 focus:ring-fixlyfy/20 focus:border-fixlyfy"
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
        className="border-fixlyfy-border hover:bg-fixlyfy/5 mt-2"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        onClick={onNewEmail}
        className="bg-fixlyfy hover:bg-fixlyfy-light text-white mt-2 ml-2"
      >
        <Plus className="h-4 w-4 mr-1" />
        New
      </Button>
    </div>
  );
};
