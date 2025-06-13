import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/ui/page-header';
import { ModernCard } from '@/components/ui/modern-card';
import { AnimatedContainer } from '@/components/ui/animated-container';
import { CalendarDays, CheckCircle2, DollarSign, Users } from 'lucide-react';

const Index = () => {
  return (
    <PageLayout>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          subtitle="Welcome back! Here's what's happening with your business."
        />

        <AnimatedContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ModernCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
                  <p className="text-muted-foreground mt-1">$56,000</p>
                </div>
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </ModernCard>

            <ModernCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Active Jobs</h3>
                  <p className="text-muted-foreground mt-1">24 Jobs</p>
                </div>
                <CalendarDays className="h-6 w-6 text-blue-500" />
              </div>
            </ModernCard>

            <ModernCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">New Clients</h3>
                  <p className="text-muted-foreground mt-1">8 Clients</p>
                </div>
                <Users className="h-6 w-6 text-purple-500" />
              </div>
            </ModernCard>

            <ModernCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Satisfaction</h3>
                  <p className="text-muted-foreground mt-1">98%</p>
                </div>
                <CheckCircle2 className="h-6 w-6 text-yellow-500" />
              </div>
            </ModernCard>
          </div>
        </AnimatedContainer>
      </div>
    </PageLayout>
  );
};

export default Index;
