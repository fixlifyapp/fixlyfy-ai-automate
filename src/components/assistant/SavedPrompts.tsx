
import { useState } from "react";
import { SavedPrompt } from "@/types/assistant";
import { format } from "date-fns";
import { Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface SavedPromptsProps {
  savedPrompts: SavedPrompt[];
  onSelectPrompt: (prompt: string) => void;
}

export const SavedPrompts = ({ savedPrompts, onSelectPrompt }: SavedPromptsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredPrompts = savedPrompts.filter(
    prompt => 
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      prompt.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search saved prompts"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {filteredPrompts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No saved prompts found</p>
              <p className="text-sm">Save prompts to quickly reuse them later</p>
            </div>
          ) : (
            filteredPrompts.map((prompt) => (
              <div 
                key={prompt.id}
                className="border rounded-lg p-3 hover:bg-accent cursor-pointer"
                onClick={() => onSelectPrompt(prompt.content)}
              >
                <div className="font-medium">{prompt.title}</div>
                <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {prompt.content}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {format(new Date(prompt.timestamp), "MMM d, yyyy")}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
