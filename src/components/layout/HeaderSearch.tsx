import { useState, useEffect } from 'react';
import { Search, FileText, Users, Briefcase, Receipt } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'client' | 'job' | 'estimate' | 'invoice';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

export const HeaderSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [debouncedQuery]);

  const performSearch = async (searchTerm: string) => {
    setIsLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // Search clients
      const { data: clients } = await supabase
        .from('clients')
        .select('id, name, email, phone, address')
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)
        .limit(5);

      if (clients) {
        clients.forEach(client => {
          searchResults.push({
            id: client.id,
            type: 'client',
            title: client.name,
            subtitle: client.email || client.phone || 'Client',
            icon: <Users className="h-4 w-4 text-blue-500" />
          });
        });
      }

      // Search jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select(`
          id, 
          title, 
          address,
          clients:client_id(name)
        `)
        .or(`id.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)
        .limit(5);

      if (jobs) {
        jobs.forEach(job => {
          searchResults.push({
            id: job.id,
            type: 'job',
            title: job.title || `Job ${job.id}`,
            subtitle: job.clients?.name || job.address || 'Job',
            icon: <Briefcase className="h-4 w-4 text-green-500" />
          });
        });
      }

      // Mock estimates and invoices since they don't exist in database
      if (searchTerm.toLowerCase().includes('est')) {
        searchResults.push({
          id: 'est-1',
          type: 'estimate',
          title: 'Estimate EST-001',
          subtitle: 'Mock estimate',
          icon: <FileText className="h-4 w-4 text-orange-500" />
        });
      }

      if (searchTerm.toLowerCase().includes('inv')) {
        searchResults.push({
          id: 'inv-1',
          type: 'invoice',
          title: 'Invoice INV-001',
          subtitle: 'Mock invoice',
          icon: <Receipt className="h-4 w-4 text-purple-500" />
        });
      }

      setResults(searchResults);
      setShowResults(searchResults.length > 0);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setQuery('');
    setShowResults(false);
    
    switch (result.type) {
      case 'client':
        navigate(`/clients/${result.id}`);
        break;
      case 'job':
        navigate(`/jobs/${result.id}`);
        break;
      case 'estimate':
      case 'invoice':
        // Navigate to jobs page and open the relevant tab
        navigate(`/jobs`);
        break;
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search clients, jobs, estimates, invoices..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4"
          onFocus={() => setShowResults(results.length > 0)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
      </div>

      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto">
          <CardContent className="p-0">
            {results.map((result) => (
              <div
                key={`${result.type}-${result.id}`}
                className={cn(
                  "flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0",
                  "transition-colors duration-150"
                )}
                onClick={() => handleResultClick(result)}
              >
                {result.icon}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {result.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {result.subtitle}
                  </p>
                </div>
                <span className="text-xs text-gray-400 capitalize">
                  {result.type}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center justify-center p-4">
                <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
