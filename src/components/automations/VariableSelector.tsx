
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Variable, Search, Info } from "lucide-react";
import { useAutomations } from "@/hooks/useAutomations";
import { useIsMobile } from "@/hooks/use-mobile";

interface VariableSelectorProps {
  onSelectVariable: (variable: string) => void;
}

export const VariableSelector = ({ onSelectVariable }: VariableSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { variables } = useAutomations();
  const isMobile = useIsMobile();

  const filteredVariables = variables.filter(variable =>
    variable.variable_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variable.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variable.data_source?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group variables by data source
  const groupedVariables = filteredVariables.reduce((acc, variable) => {
    const source = variable.data_source || 'Other';
    if (!acc[source]) {
      acc[source] = [];
    }
    acc[source].push(variable);
    return acc;
  }, {} as Record<string, typeof variables>);

  const categories = Object.keys(groupedVariables);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size={isMobile ? "sm" : "sm"} className={`ml-2 ${isMobile ? 'text-xs px-2' : ''}`}>
          <Variable className={isMobile ? "w-3 h-3 mr-1" : "w-4 h-4 mr-1"} />
          {isMobile ? "Vars" : "Variables"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`p-0 ${isMobile ? 'w-80' : 'w-96'}`} align="start">
        <div className={`border-b ${isMobile ? 'p-3' : 'p-4'}`}>
          <h4 className={`font-semibold mb-2 ${isMobile ? 'text-sm' : 'text-sm'}`}>Insert Variable</h4>
          <div className="relative">
            <Search className={`absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
            <Input
              placeholder={isMobile ? "Search..." : "Search variables..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={isMobile ? "pl-7 text-sm h-8" : "pl-8"}
            />
          </div>
        </div>
        
        <ScrollArea className={isMobile ? "h-48" : "h-64"}>
          <div className={isMobile ? "p-2" : "p-2"}>
            {categories.map(category => {
              const categoryVariables = groupedVariables[category];
              if (categoryVariables.length === 0) return null;
              
              return (
                <div key={category} className={isMobile ? "mb-3" : "mb-4"}>
                  <h5 className={`font-medium text-gray-500 uppercase tracking-wide mb-2 px-2 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                    {category}
                  </h5>
                  <div className="space-y-1">
                    {categoryVariables.map(variable => (
                      <button
                        key={variable.id}
                        onClick={() => onSelectVariable(`{{${variable.variable_key}}}`)}
                        className={`w-full text-left rounded hover:bg-gray-100 transition-colors ${isMobile ? 'p-2' : 'p-2'}`}
                      >
                        <div className={`flex items-center justify-between ${isMobile ? 'mb-1' : 'mb-1'}`}>
                          <Badge variant="outline" className={isMobile ? "text-xs px-1 py-0" : "text-xs"}>
                            {`{{${variable.variable_key}}}`}
                          </Badge>
                        </div>
                        <p className={`text-gray-600 mb-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>{variable.description}</p>
                        <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-xs'}`}>Source: {variable.data_source}</p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {filteredVariables.length === 0 && (
              <div className={`text-center py-4 text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                No variables found matching your search.
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className={`border-t bg-gray-50 ${isMobile ? 'p-2' : 'p-3'}`}>
          <div className={`flex items-start gap-2 text-gray-600 ${isMobile ? 'text-xs' : 'text-xs'}`}>
            <Info className={`flex-shrink-0 ${isMobile ? 'w-3 h-3 mt-0.5' : 'w-3 h-3 mt-0.5'}`} />
            <p>{isMobile ? "Variables auto-replace when running." : "Variables will be automatically replaced with actual values when the automation runs."}</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
