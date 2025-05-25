
import { useClientProperties as useClientPropertiesHook } from "@/hooks/useClientProperties";

export const useClientProperties = (clientId?: string) => {
  return useClientPropertiesHook(clientId);
};
