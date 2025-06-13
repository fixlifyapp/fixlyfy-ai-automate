
import React from 'react';
import { ModernCard } from '@/components/ui/modern-card';
import { AnimatedContainer } from '@/components/ui/animated-container';

const PortalProfile = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        <AnimatedContainer>
          <ModernCard className="p-6">
            <p>Portal profile functionality coming soon...</p>
          </ModernCard>
        </AnimatedContainer>
      </div>
    </div>
  );
};

export default PortalProfile;
