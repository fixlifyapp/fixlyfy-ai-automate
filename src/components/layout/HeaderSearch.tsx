
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, Briefcase, FileText, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SearchResult {
  id: string;
  type: 'client' | 'job' | 'estimate' | 'invoice';
  title: string;
  subtitle?: string;
  path: string;
}

export const HeaderSearch = () => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults: SearchResult[] = [];

        // Search clients
        const { data: clients } = await supabase
          .from('clients')
          .select('id, name, email, phone')
          .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
          .limit(5);

        if (clients) {
          clients.forEach(client => {
            searchResults.push({
              id: client.id,
              type: 'client',
              title: client.name,
              subtitle: client.email || client.phone,
              path: `/clients/${client.id}`
            });
          });
        }

        // Search jobs
        const { data: jobs } = await supabase
          .from('jobs')
          .select('id, title, description, status')
          .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,id.ilike.%${searchTerm}%`)
          .limit(5);

        if (jobs) {
          jobs.forEach(job => {
            searchResults.push({
              id: job.id,
              type: 'job',
              title: job.title || `Job ${job.id}`,
              subtitle: job.status,
              path: `/jobs/${job.id}`
            });
          });
        }

        // Search estimates
        const { data: estimates } = await supabase
          .from('estimates')
          .select('id, estimate_number, total, status')
          .or(`estimate_number.ilike.%${searchTerm}%`)
          .limit(5);

        if (estimates) {
          estimates.forEach(estimate => {
            searchResults.push({
              id: estimate.id,
              type: 'estimate',
              title: estimate.estimate_number,
              subtitle: `$${estimate.total} - ${estimate.status}`,
              path: `/estimates/${estimate.id}`
            });
          });
        }

        // Search invoices
        const { data: invoices } = await supabase
          .from('invoices')
          .select('id, invoice_number, total, status')
          .or(`invoice_number.ilike.%${searchTerm}%`)
          .limit(5);

        if (invoices) {
          invoices.forEach(invoice => {
            searchResults.push({
              id: invoice.id,
              type: 'invoice',
              title: invoice.invoice_number,
              subtitle: `$${invoice.total} - ${invoice.status}`,
              path: `/invoices/${invoice.id}`
            });
          });
        }

        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimeout = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'client':
        return <Users className="h-4 w-4" />;
      case 'job':
        return <Briefcase className="h-4 w-4" />;
      case 'estimate':
        return <FileText className="h-4 w-4" />;
      case 'invoice':
        return <Receipt className="h-4 w-4" />;
    }
  };

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-64 justify-start text-muted-foreground"
        >
          <Search className="mr-2 h-4 w-4" />
          Search clients, jobs, estimates...
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {isLoading && (
              <CommandEmpty>Searching...</CommandEmpty>
            )}
            {!isLoading && results.length === 0 && searchTerm.length >= 2 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            {!isLoading && searchTerm.length < 2 && (
              <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>
            )}
            {results.length > 0 && (
              <CommandGroup>
                {results.map((result) => (
                  <CommandItem
                    key={`${result.type}-${result.id}`}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-2"
                  >
                    {getIcon(result.type)}
                    <div className="flex-1">
                      <div className="font-medium">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-sm text-muted-foreground">
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {result.type}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
