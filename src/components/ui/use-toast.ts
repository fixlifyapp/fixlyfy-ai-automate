
// Simple re-export to avoid conflicts
export { toast } from "sonner";
export const useToast = () => ({
  toast: (props: any) => console.log('Toast:', props),
  dismiss: () => {},
  toasts: []
});
