
import { JobPayments } from "../JobPayments";

interface ModernJobPaymentsTabProps {
  jobId: string;
}

export const ModernJobPaymentsTab = ({ jobId }: ModernJobPaymentsTabProps) => {
  return <JobPayments jobId={jobId} />;
};
