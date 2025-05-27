
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

interface PageLoadingProps {
  className?: string;
}

export const PageLoading = ({ className }: PageLoadingProps) => {
  return (
    <div className={cn(
      "fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center",
      "animate-fade-in",
      className
    )}>
      <div className="text-center space-y-4">
        <LoadingSpinner size="xl" />
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-fixlyfy">Loading...</h3>
          <p className="text-sm text-fixlyfy-text-secondary">Preparing your workspace</p>
        </div>
      </div>
    </div>
  );
};

export const PageLoadingFallback = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="text-center space-y-6">
        <LoadingSpinner size="xl" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-fixlyfy">Loading Page...</h2>
          <p className="text-fixlyfy-text-secondary">Please wait while we load your content</p>
        </div>
      </div>
    </div>
  );
};
