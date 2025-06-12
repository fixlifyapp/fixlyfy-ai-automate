
import { useParams } from 'react-router-dom';
import { ClientEstimateView } from '@/components/jobs/estimates/ClientEstimateView';

export const EstimateViewPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid Estimate</h1>
          <p className="text-muted-foreground mt-2">
            The estimate you're looking for could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <ClientEstimateView
        estimateId={id}
        onStatusChange={(newStatus) => {
          console.log('Estimate status changed to:', newStatus);
        }}
      />
    </div>
  );
};

export default EstimateViewPage;
