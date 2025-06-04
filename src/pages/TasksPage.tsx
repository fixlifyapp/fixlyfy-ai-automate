
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { CheckSquare } from "lucide-react";

export const TasksPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Tasks"
        subtitle="Manage your tasks and to-do items"
        icon={CheckSquare}
      />
      <div className="space-y-6">
        <p className="text-gray-600">Tasks management coming soon...</p>
      </div>
    </PageLayout>
  );
};

export default TasksPage;
