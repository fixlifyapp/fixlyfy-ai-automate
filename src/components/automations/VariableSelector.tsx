
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Variable, Search, Info } from "lucide-react";

interface VariableSelectorProps {
  onSelectVariable: (variable: string) => void;
}

export const VariableSelector = ({ onSelectVariable }: VariableSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const variables = [
    {
      key: "CustomerName",
      description: "Customer's full name",
      example: "John Smith",
      category: "Customer"
    },
    {
      key: "CustomerFirstName", 
      description: "Customer's first name only",
      example: "John",
      category: "Customer"
    },
    {
      key: "CustomerPhone",
      description: "Customer's phone number",
      example: "(555) 123-4567",
      category: "Customer"
    },
    {
      key: "CustomerEmail",
      description: "Customer's email address", 
      example: "john@example.com",
      category: "Customer"
    },
    {
      key: "JobTitle",
      description: "Title/description of the job",
      example: "AC Repair",
      category: "Job"
    },
    {
      key: "JobDate",
      description: "Scheduled job date",
      example: "March 15, 2024",
      category: "Job"
    },
    {
      key: "JobTime",
      description: "Scheduled job time",
      example: "2:00 PM",
      category: "Job"
    },
    {
      key: "TechnicianName",
      description: "Assigned technician's name",
      example: "Mike Johnson",
      category: "Job"
    },
    {
      key: "EstimateAmount",
      description: "Estimate total amount",
      example: "$350.00",
      category: "Billing"
    },
    {
      key: "InvoiceAmount",
      description: "Invoice total amount",
      example: "$425.00", 
      category: "Billing"
    },
    {
      key: "InvoiceNumber",
      description: "Invoice reference number",
      example: "INV-001234",
      category: "Billing"
    },
    {
      key: "CompanyName",
      description: "Your company name",
      example: "ABC Services",
      category: "Company"
    },
    {
      key: "CompanyPhone",
      description: "Your company phone number", 
      example: "(555) 987-6543",
      category: "Company"
    }
  ];

  const filteredVariables = variables.filter(variable =>
    variable.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variable.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variable.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(variables.map(v => v.category)));

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
              const categoryVariables = filteredVariables.filter(v => v.category === category);
              if (categoryVariables.length === 0) return null;
              
              return (
                <div key={category} className="mb-4">
                  <h5 className="font-medium text-xs text-gray-500 uppercase tracking-wide mb-2 px-2">
                    {category}
                  </h5>
                  <div className="space-y-1">
                    {categoryVariables.map(variable => (
                      <button
                        key={variable.key}
                        onClick={() => onSelectVariable(`{{${variable.key}}}`)}
                        className="w-full text-left p-2 rounded hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs">
                            {`{{${variable.key}}}`}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{variable.description}</p>
                        <p className="text-xs text-gray-400">Example: {variable.example}</p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
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
