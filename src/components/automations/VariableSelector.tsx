
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Variable, Search, Info } from "lucide-react";
import { useAutomations } from "@/hooks/useAutomations";

interface VariableSelectorProps {
  onSelectVariable: (variable: string) => void;
}

export const VariableSelector = ({ onSelectVariable }: VariableSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { variables } = useAutomations();

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
        <Button variant="outline" size="sm" className="ml-2">
          <Variable className="w-4 h-4 mr-1" />
          Variables
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-4 border-b">
          <h4 className="font-semibold text-sm mb-2">Insert Variable</h4>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search variables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <ScrollArea className="h-64">
          <div className="p-2">
            {categories.map(category => {
              const categoryVariables = groupedVariables[category];
              if (categoryVariables.length === 0) return null;
              
              return (
                <div key={category} className="mb-4">
                  <h5 className="font-medium text-xs text-gray-500 uppercase tracking-wide mb-2 px-2">
                    {category}
                  </h5>
                  <div className="space-y-1">
                    {categoryVariables.map(variable => (
                      <button
                        key={variable.id}
                        onClick={() => onSelectVariable(`{{${variable.variable_key}}}`)}
                        className="w-full text-left p-2 rounded hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs">
                            {`{{${variable.variable_key}}}`}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{variable.description}</p>
                        <p className="text-xs text-gray-400">Source: {variable.data_source}</p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {filteredVariables.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No variables found matching your search.
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-3 border-t bg-gray-50">
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <p>Variables will be automatically replaced with actual values when the automation runs.</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
