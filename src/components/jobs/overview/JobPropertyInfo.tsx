
import React from "react";

interface Property {
  id: string;
  property_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  property_type?: string;
  notes?: string;
}

interface JobPropertyInfoProps {
  jobId: string;
  propertyData: Property | null;
}

export const JobPropertyInfo = ({ jobId, propertyData }: JobPropertyInfoProps) => {
  if (!propertyData) {
    return <div className="text-sm text-muted-foreground">No property information available</div>;
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-muted-foreground">Property Name</label>
        <p className="text-sm">{propertyData.property_name || 'Unnamed Property'}</p>
      </div>

      {propertyData.address && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Address</label>
          <p className="text-sm">
            {[propertyData.address, propertyData.city, propertyData.state, propertyData.zip]
              .filter(Boolean)
              .join(', ')}
          </p>
        </div>
      )}

      {propertyData.property_type && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Property Type</label>
          <p className="text-sm">{propertyData.property_type}</p>
        </div>
      )}

      {propertyData.notes && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Notes</label>
          <p className="text-sm">{propertyData.notes}</p>
        </div>
      )}
    </div>
  );
};
