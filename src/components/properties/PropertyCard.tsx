
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Home, MapPin, MoreVertical, Star, Edit, Trash2 } from "lucide-react";
import { ClientProperty } from "@/types/property";

interface PropertyCardProps {
  property: ClientProperty;
  onEdit: (property: ClientProperty) => void;
  onDelete: (propertyId: string) => void;
  onSetPrimary: (propertyId: string) => void;
}

export const PropertyCard = ({ property, onEdit, onDelete, onSetPrimary }: PropertyCardProps) => {
  const getFullAddress = () => {
    const parts = [property.address, property.city, property.state, property.zip, property.country];
    return parts.filter(Boolean).join(', ');
  };

  return (
    <Card className="relative">
      {property.is_primary && (
        <Badge className="absolute top-2 right-2 bg-yellow-100 text-yellow-800">
          <Star className="w-3 h-3 mr-1" />
          Primary
        </Badge>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
              <Home className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{property.property_name}</CardTitle>
              <Badge variant="outline" className="mt-1">
                {property.property_type}
              </Badge>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(property)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {!property.is_primary && (
                <DropdownMenuItem onClick={() => onSetPrimary(property.id)}>
                  <Star className="h-4 w-4 mr-2" />
                  Set as Primary
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete(property.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        {getFullAddress() && (
          <div className="flex items-start space-x-2 text-sm text-gray-600 mb-3">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{getFullAddress()}</span>
          </div>
        )}
        
        {property.notes && (
          <div className="text-sm text-gray-500 mt-2">
            <strong>Notes:</strong> {property.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
