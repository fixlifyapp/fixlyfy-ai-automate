
import { PageLayout } from "@/components/layout/PageLayout";

const FinancePage = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Finance</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-fixlyfy-text-secondary">Finance management coming soon...</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default FinancePage;
