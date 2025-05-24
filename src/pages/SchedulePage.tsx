
import { PageLayout } from "@/components/layout/PageLayout";
import { ScheduleCalendar } from "@/components/schedule/ScheduleCalendar";

const SchedulePage = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Schedule</h1>
        </div>
        <ScheduleCalendar />
      </div>
    </PageLayout>
  );
};

export default SchedulePage;
