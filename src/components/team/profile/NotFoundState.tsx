
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";

interface NotFoundStateProps {
  onGoBack: () => void;
}

export const NotFoundState = ({ onGoBack }: NotFoundStateProps) => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Team Member Not Found</h1>
          <Button onClick={onGoBack}>Return to Team List</Button>
        </div>
      </div>
    </PageLayout>
  );
};
