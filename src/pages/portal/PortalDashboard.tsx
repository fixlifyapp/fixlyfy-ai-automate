
import React from 'react';
import { ModernCard } from '@/components/ui/modern-card';
import { AnimatedContainer } from '@/components/ui/animated-container';

const PortalDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome to Your Portal</h1>
          <p className="text-muted-foreground">Manage your services and account</p>
        </div>

        <AnimatedContainer>
          <ModernCard className="p-6">
            <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
            <p>Portal dashboard functionality coming soon...</p>
          </ModernCard>
        </AnimatedContainer>
      </div>
    </div>
  );
};

export default PortalDashboard;
