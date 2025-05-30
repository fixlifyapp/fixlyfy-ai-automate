
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Home, Building2 } from "lucide-react";
import { useClientProperties } from "@/hooks/useClientProperties";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PropertyInfo {
  id?: string;
  property_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  property_type?: string;
}

interface PropertyInfoSectionProps {
  job: any;
}

export const PropertyInfoSection = ({ job }: PropertyInfoSectionProps) => {
  const { properties } = useClientProperties(job?.client_id);
  const [propertyInfo, setPropertyInfo] = useState<PropertyInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPropertyInfo = async () => {
      if (!job) return;

      setLoading(true);
      try {
        let property: PropertyInfo | null = null;

        // Strategy 1: If job has property_id, fetch from client_properties
        if (job.property_id) {
          const { data: propertyData, error } = await supabase
            .from('client_properties')
            .select('*')
            .eq('id', job.property_id)
            .maybeSingle();

          if (propertyData && !error) {
            property = {
              id: propertyData.id,
              property_name: propertyData.property_name,
              address: propertyData.address,
              city: propertyData.city,
              state: propertyData.state,
              zip: propertyData.zip,
              property_type: propertyData.property_type
            };
          }
        }

        // Strategy 2: If no property found but job has address, use job address
        if (!property && job.address) {
          property = {
            address: job.address,
            property_type: 'Service Location'
          };
        }

        // Strategy 3: If no property but we have client properties, use primary
        if (!property && properties.length > 0) {
          const primaryProperty = properties.find(p => p.is_primary) || properties[0];
          property = {
            id: primaryProperty.id,
            property_name: primaryProperty.property_name,
            address: primaryProperty.address,
            city: primaryProperty.city,
            state: primaryProperty.state,
            zip: primaryProperty.zip,
            property_type: primaryProperty.property_type
          };
        }

        setPropertyInfo(property);
      } catch (error) {
        console.error('Error fetching property info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyInfo();
  }, [job, properties]);

  const formatAddress = (property: PropertyInfo) => {
    if (!property) return 'No address available';
    
    const parts = [
      property.address,
      [property.city, property.state, property.zip].filter(Boolean).join(', ')
    ].filter(Boolean);
    
    return parts.join('\n') || 'Address not specified';
  };

  if (loading) {
    return (
      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-blue-600" />
            Property Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-blue-600" />
          Property Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {propertyInfo ? (
          <>
            {propertyInfo.property_name && (
              <div className="flex items-start gap-3">
                <Home className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">{propertyInfo.property_name}</p>
                  {propertyInfo.property_type && (
                    <p className="text-sm text-gray-600">{propertyInfo.property_type}</p>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3">
              <Building2 className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-700 mb-1">Service Address</p>
                <p className="text-gray-900 whitespace-pre-line leading-relaxed">
                  {formatAddress(propertyInfo)}
                </p>
              </div>
            </div>

            {propertyInfo.property_type && !propertyInfo.property_name && (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4"></div>
                <span className="inline-block px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                  {propertyInfo.property_type}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-start gap-3">
            <Building2 className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Service Address</p>
              <p className="text-gray-400 italic">No property information available</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
