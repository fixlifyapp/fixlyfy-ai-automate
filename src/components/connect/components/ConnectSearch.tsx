
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";

interface ConnectSearchProps {
  onSearchResults: (results: any[]) => void;
}

export const ConnectSearch = ({ onSearchResults }: ConnectSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  // Use debounced search term to avoid too many queries
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Effect to perform search when debounced term changes
  useState(() => {
    if (!debouncedSearchTerm) {
      // If search is cleared, reset results
      onSearchResults([]);
      return;
    }
    
    const performSearch = async () => {
      setIsSearching(true);
      try {
        // Search in clients table for name or phone
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('id, name, phone')
          .or(`name.ilike.%${debouncedSearchTerm}%,phone.ilike.%${debouncedSearchTerm}%`)
          .limit(10);
          
        if (clientError) throw clientError;
        
        // Search in conversations by client information
        const { data: conversationData, error: convError } = await supabase
          .from('conversations')
          .select(`
            id,
            client_id,
            clients:client_id(id, name, phone)
          `)
          .order('last_message_at', { ascending: false });
        
        if (convError) throw convError;

        // Also search in jobs by id or title
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select(`
            id, 
            title,
            client_id,
            clients:client_id(id, name, phone)
          `)
          .or(`id.ilike.%${debouncedSearchTerm}%,title.ilike.%${debouncedSearchTerm}%`)
          .limit(10);
        
        if (jobError) throw jobError;
        
        // Combine and deduplicate results
        const clientResults = clientData.map(client => ({
          type: 'client',
          id: client.id,
          name: client.name,
          phone: client.phone,
          sourceId: client.id
        }));
        
        const conversationResults = conversationData
          .filter(conv => 
            conv.clients?.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
            (conv.clients?.phone && conv.clients.phone.includes(debouncedSearchTerm))
          )
          .map(conv => ({
            type: 'conversation',
            id: conv.clients?.id,
            name: conv.clients?.name || 'Unknown Client',
            phone: conv.clients?.phone,
            sourceId: conv.id
          }));
        
        const jobResults = jobData.map(job => ({
          type: 'job',
          id: job.clients?.id,
          name: job.clients?.name || 'Unknown Client',
          phone: job.clients?.phone,
          sourceId: job.id,
          jobTitle: job.title
        }));

        // Combine results, preferring clients with conversations
        const allResults = [...clientResults, ...conversationResults, ...jobResults];
        
        // Deduplicate by client id
        const uniqueResults = allResults.reduce((acc: any[], current) => {
          const x = acc.find(item => item.id === current.id);
          if (!x) {
            return acc.concat([current]);
          } else {
            // If we already have this client, but this is a conversation result, prioritize it
            if (current.type === 'conversation' && x.type !== 'conversation') {
              // Replace the existing entry with this one
              return acc.map(item => item.id === current.id ? current : item);
            }
            return acc;
          }
        }, []);
        
        onSearchResults(uniqueResults);
      } catch (error) {
        console.error("Error performing search:", error);
        toast.error("Search failed. Please try again.");
      } finally {
        setIsSearching(false);
      }
    };
    
    performSearch();
  }, [debouncedSearchTerm, onSearchResults]);
  
  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fixlyfy-text-secondary" size={18} />
      <Input 
        placeholder="Search clients, phone numbers, jobs..."
        className="pl-10"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {isSearching && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="h-4 w-4 border-2 border-fixlyfy border-r-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
