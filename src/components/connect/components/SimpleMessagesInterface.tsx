
import { MessageSquare } from "lucide-react";

export const SimpleMessagesInterface = () => {
  return (
    <div className="h-[700px] border border-fixlyfy-border rounded-xl overflow-hidden bg-white shadow-card">
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-fixlyfy-bg-interface to-fixlyfy/5">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-fixlyfy/10 rounded-full p-6 mx-auto mb-6 w-24 h-24 flex items-center justify-center">
            <MessageSquare className="h-12 w-12 text-fixlyfy" />
          </div>
          <h3 className="text-xl font-semibold text-fixlyfy-text mb-3">SMS Feature Removed</h3>
          <p className="text-fixlyfy-text-secondary leading-relaxed">
            The SMS conversation functionality has been completely removed from this application.
          </p>
        </div>
      </div>
    </div>
  );
};
