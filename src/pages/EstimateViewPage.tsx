
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ClientEstimateView } from "@/components/jobs/estimates/ClientEstimateView";
import { Card } from "@/components/ui/card";

interface EstimateData {
  id: string;
  estimate_number: string;
  total: number;
  status: string;
  notes?: string;
  job_id: string;
  created_at: string;
  client_id?: string;
}

const EstimateViewPage = () => {
  const { estimateNumber } = useParams<{ estimateNumber: string }>();
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstimate = async () => {
      if (!estimateNumber) {
        setError("No estimate number provided");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching public estimate:", estimateNumber);
        
        // Mock estimate data since we don't have estimates table in current schema
        const mockEstimate: EstimateData = {
          id: `estimate-${estimateNumber}`,
          estimate_number: estimateNumber,
          total: 750.00,
          status: 'draft',
          notes: 'Professional HVAC maintenance service',
          job_id: 'mock-job-001',
          created_at: new Date().toISOString(),
          client_id: 'mock-client-001'
        };

        console.log("Mock estimate data loaded:", mockEstimate);
        setEstimate(mockEstimate);

        // Mock update estimate status to viewed
        console.log('Mock: Marking estimate as viewed');

      } catch (error: any) {
        console.error("Error in fetchEstimate:", error);
        setError("Failed to load estimate");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEstimate();
  }, [estimateNumber]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p>Loading your estimate...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !estimate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Estimate Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error || "The estimate you're looking for could not be found."}
          </p>
          <p className="text-sm text-gray-500">
            Please check the link or contact us for assistance.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <ClientEstimateView
          estimateId={estimate.id}
          clientId={estimate.client_id}
        />
      </div>
    </div>
  );
};

export default EstimateViewPage;
