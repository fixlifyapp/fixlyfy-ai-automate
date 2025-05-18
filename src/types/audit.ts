
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  recordId: string;
  changeDescription: string;
}

export type ModuleType = 
  | "all" 
  | "jobs" 
  | "clients" 
  | "payments" 
  | "team" 
  | "settings" 
  | "products" 
  | "automations";
