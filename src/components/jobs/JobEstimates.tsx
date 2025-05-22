
// This file is an alias for JobEstimatesTab.tsx to maintain compatibility
// Import from the main job details hook for consistency
import { useJobDetailsHeader } from "@/components/jobs/header/useJobDetailsHeader";

export { JobEstimatesTab as JobEstimates } from './JobEstimatesTab';

// Also export the hook for any component that needs it
export { useJobDetailsHeader };
