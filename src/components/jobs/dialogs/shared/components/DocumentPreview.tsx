
import React from "react";

interface DocumentPreviewProps {
  documentType: "estimate" | "invoice";
  documentNumber: string;
  total: number;
  contactInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

export const DocumentPreview = ({
  documentType,
  documentNumber,
  total,
  contactInfo
}: DocumentPreviewProps) => {
  return (
    <div className="bg-blue-50 p-3 rounded-lg">
      <p className="text-sm text-blue-800">
        <strong>Total:</strong> ${total.toFixed(2)}
      </p>
      {contactInfo?.name && (
        <p className="text-sm text-blue-800 truncate">
          <strong>Customer:</strong> {contactInfo.name}
        </p>
      )}
    </div>
  );
};
