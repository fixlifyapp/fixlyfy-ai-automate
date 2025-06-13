
import React from 'react';
import { ModernCard } from '@/components/ui/modern-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PortalLoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <ModernCard className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Client Portal</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <div className="space-y-4">
          <Input placeholder="Email" type="email" />
          <Input placeholder="Password" type="password" />
          <Button className="w-full">Sign In</Button>
        </div>
      </ModernCard>
    </div>
  );
};

export default PortalLoginPage;
