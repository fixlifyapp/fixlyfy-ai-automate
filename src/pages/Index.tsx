
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="fixlyfy-gradient rounded-full p-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-fixlyfy-bg p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-xl fixlyfy-gradient flex items-center justify-center text-white font-bold text-3xl">
            F
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2">Welcome to Fixlyfy</h1>
        <p className="text-fixlyfy-text-secondary text-center mb-8">
          The smart field service management platform powered by AI
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/auth')} 
            className="w-full bg-fixlyfy hover:bg-fixlyfy/90 py-6 text-lg"
          >
            Get Started
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.open('https://docs.fixlyfy.com', '_blank')}
            className="w-full py-5 text-lg"
          >
            Learn More
          </Button>
        </div>
        
        <div className="mt-12 border-t pt-6">
          <p className="text-center text-fixlyfy-text-secondary text-sm">
            © 2023 Fixlyfy. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
