
import { useParams } from "react-router-dom";

export const JobDetailsHeader = () => {
  const { id } = useParams();
  
  return (
    <div className="fixlyfy-card p-6">
      <h2 className="text-lg font-medium">Job Details Header</h2>
      <p className="text-muted-foreground">Job ID: {id}</p>
      <p className="text-sm mt-2">This component has been reset and is ready to be rebuilt.</p>
    </div>
  );
};
