
import { ReactNode } from "react";
import { useClientPortalAuth } from "@/hooks/useClientPortalAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, FileText, CreditCard, User, LogOut, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface PortalLayoutProps {
  children: ReactNode;
}

export function PortalLayout({ children }: PortalLayoutProps) {
  const { user, signOut } = useClientPortalAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { path: "/portal/dashboard", label: "Dashboard", icon: Home },
    { path: "/portal/estimates", label: "Estimates", icon: FileText },
    { path: "/portal/invoices", label: "Invoices", icon: CreditCard },
    { path: "/portal/profile", label: "Profile", icon: User },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/portal/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Client Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => navigate(item.path)}
                    >
                      <Icon size={16} className="mr-2" />
                      {item.label}
                    </Button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
