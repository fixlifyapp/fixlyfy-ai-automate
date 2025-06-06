
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, X } from "lucide-react";

interface SendMethodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMethod: (method: "email" | "sms") => void;
  documentType: "estimate" | "invoice";
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

export const SendMethodDialog = ({ 
  isOpen, 
  onClose, 
  onSelectMethod, 
  documentType,
  contactInfo 
}: SendMethodDialogProps) => {
  if (!isOpen) return null;

  const hasEmail = contactInfo.email && contactInfo.email.trim() !== '';
  const hasPhone = contactInfo.phone && contactInfo.phone.trim() !== '';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Send {documentType.charAt(0).toUpperCase() + documentType.slice(1)}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Choose how you'd like to send the {documentType} to {contactInfo.name}:
          </div>

          <div className="space-y-3">
            {hasEmail && (
              <Button
                onClick={() => onSelectMethod("email")}
                variant="outline"
                className="w-full flex items-center gap-3 h-auto p-4"
              >
                <Mail className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Send via Email</div>
                  <div className="text-sm text-gray-500">{contactInfo.email}</div>
                </div>
              </Button>
            )}

            {hasPhone && (
              <Button
                onClick={() => onSelectMethod("sms")}
                variant="outline"
                className="w-full flex items-center gap-3 h-auto p-4"
              >
                <MessageSquare className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">Send via SMS</div>
                  <div className="text-sm text-gray-500">{contactInfo.phone}</div>
                </div>
              </Button>
            )}
          </div>

          {!hasEmail && !hasPhone && (
            <div className="text-center py-4 text-gray-500">
              No email or phone number available for this client.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
