
import { AuditLogEntry } from "@/types/audit";
import { v4 as uuidv4 } from "uuid";

export const sampleAuditLogEntries: AuditLogEntry[] = [
  {
    id: uuidv4(),
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    userId: "user1",
    userName: "Michael Chen",
    action: "status_change",
    module: "jobs",
    recordId: "j785",
    changeDescription: "Status: Scheduled → Completed"
  },
  {
    id: uuidv4(),
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    userId: "user2",
    userName: "Sarah Johnson",
    action: "payment_processed",
    module: "payments",
    recordId: "p342",
    changeDescription: "Amount: $175.99, Method: Credit Card"
  },
  {
    id: uuidv4(),
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    userId: "user3",
    userName: "David Kim",
    action: "client_added",
    module: "clients",
    recordId: "c108",
    changeDescription: "New client: John Anderson"
  },
  {
    id: uuidv4(),
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    userId: "user1",
    userName: "Michael Chen",
    action: "invoice_created",
    module: "jobs",
    recordId: "j782",
    changeDescription: "Invoice #INV-2023-105 created"
  },
  {
    id: uuidv4(),
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    userId: "user4",
    userName: "Emily Rodriguez",
    action: "role_changed",
    module: "team",
    recordId: "team3",
    changeDescription: "Role: Technician → Manager"
  },
  {
    id: uuidv4(),
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    userId: "user2",
    userName: "Sarah Johnson",
    action: "setting_changed",
    module: "settings",
    recordId: "settings",
    changeDescription: "Company Name: ABC Services → ABC Professional Services"
  },
  {
    id: uuidv4(),
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    userId: "user5",
    userName: "Admin User",
    action: "product_added",
    module: "products",
    recordId: "prod89",
    changeDescription: "Added: HVAC Filter Premium"
  }
];
