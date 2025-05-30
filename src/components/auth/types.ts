
export type UserRole = 'admin' | 'manager' | 'dispatcher' | 'technician';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

// Define all available permissions in the system
export const PERMISSIONS_LIST: Permission[] = [
  // Jobs permissions
  { id: 'jobs.view.all', name: 'View All Jobs', description: 'Can view all jobs in the system', category: 'jobs' },
  { id: 'jobs.view.assigned', name: 'View Assigned Jobs', description: 'Can view jobs assigned to them', category: 'jobs' },
  { id: 'jobs.create', name: 'Create Jobs', description: 'Can create new jobs', category: 'jobs' },
  { id: 'jobs.edit.all', name: 'Edit All Jobs', description: 'Can edit any job', category: 'jobs' },
  { id: 'jobs.edit.assigned', name: 'Edit Assigned Jobs', description: 'Can edit jobs assigned to them', category: 'jobs' },
  { id: 'jobs.delete', name: 'Delete Jobs', description: 'Can delete jobs', category: 'jobs' },
  { id: 'jobs.assign', name: 'Assign Jobs', description: 'Can assign jobs to technicians', category: 'jobs' },

  // Clients permissions
  { id: 'clients.view.all', name: 'View All Clients', description: 'Can view all clients', category: 'clients' },
  { id: 'clients.view.assigned', name: 'View Assigned Clients', description: 'Can view assigned clients', category: 'clients' },
  { id: 'clients.create', name: 'Create Clients', description: 'Can create new clients', category: 'clients' },
  { id: 'clients.edit', name: 'Edit Clients', description: 'Can edit client information', category: 'clients' },
  { id: 'clients.delete', name: 'Delete Clients', description: 'Can delete clients', category: 'clients' },

  // Estimates permissions
  { id: 'estimates.view.all', name: 'View All Estimates', description: 'Can view all estimates', category: 'estimates' },
  { id: 'estimates.view.assigned', name: 'View Assigned Estimates', description: 'Can view assigned estimates', category: 'estimates' },
  { id: 'estimates.create', name: 'Create Estimates', description: 'Can create new estimates', category: 'estimates' },
  { id: 'estimates.edit', name: 'Edit Estimates', description: 'Can edit estimates', category: 'estimates' },
  { id: 'estimates.delete', name: 'Delete Estimates', description: 'Can delete estimates', category: 'estimates' },
  { id: 'estimates.send', name: 'Send Estimates', description: 'Can send estimates to clients', category: 'estimates' },

  // Invoices permissions
  { id: 'invoices.view.all', name: 'View All Invoices', description: 'Can view all invoices', category: 'invoices' },
  { id: 'invoices.view.assigned', name: 'View Assigned Invoices', description: 'Can view assigned invoices', category: 'invoices' },
  { id: 'invoices.create', name: 'Create Invoices', description: 'Can create new invoices', category: 'invoices' },
  { id: 'invoices.edit', name: 'Edit Invoices', description: 'Can edit invoices', category: 'invoices' },
  { id: 'invoices.delete', name: 'Delete Invoices', description: 'Can delete invoices', category: 'invoices' },
  { id: 'invoices.send', name: 'Send Invoices', description: 'Can send invoices to clients', category: 'invoices' },

  // User management permissions
  { id: 'users.view', name: 'View Users', description: 'Can view user list', category: 'users' },
  { id: 'users.create', name: 'Create Users', description: 'Can create new users', category: 'users' },
  { id: 'users.edit', name: 'Edit Users', description: 'Can edit user information', category: 'users' },
  { id: 'users.delete', name: 'Delete Users', description: 'Can delete users', category: 'users' },
  { id: 'users.roles.assign', name: 'Assign Roles', description: 'Can assign roles to users', category: 'users' },

  // Products permissions
  { id: 'products.view', name: 'View Products', description: 'Can view products', category: 'products' },
  { id: 'products.create', name: 'Create Products', description: 'Can create new products', category: 'products' },
  { id: 'products.edit', name: 'Edit Products', description: 'Can edit products', category: 'products' },
  { id: 'products.delete', name: 'Delete Products', description: 'Can delete products', category: 'products' },

  // Schedule permissions
  { id: 'schedule.view.all', name: 'View All Schedules', description: 'Can view all schedules', category: 'schedule' },
  { id: 'schedule.view.own', name: 'View Own Schedule', description: 'Can view own schedule', category: 'schedule' },
  { id: 'schedule.edit', name: 'Edit Schedules', description: 'Can edit schedules', category: 'schedule' },
  { id: 'schedule.edit.own', name: 'Edit Own Schedule', description: 'Can edit own schedule', category: 'schedule' },
  { id: 'schedule.assign', name: 'Assign Schedules', description: 'Can assign schedules to technicians', category: 'schedule' },

  // Reports permissions
  { id: 'reports.view.all', name: 'View All Reports', description: 'Can view all reports', category: 'reports' },
  { id: 'reports.view.assigned', name: 'View Assigned Reports', description: 'Can view assigned reports', category: 'reports' },
  { id: 'reports.view.own', name: 'View Own Reports', description: 'Can view own reports', category: 'reports' },
  { id: 'reports.create', name: 'Create Reports', description: 'Can create new reports', category: 'reports' },
  { id: 'reports.export', name: 'Export Reports', description: 'Can export reports', category: 'reports' },

  // Finance permissions
  { id: 'finance.view', name: 'View Finance', description: 'Can view financial data', category: 'finance' },
  { id: 'finance.edit', name: 'Edit Finance', description: 'Can edit financial data', category: 'finance' },
  { id: 'finance.payments', name: 'Process Payments', description: 'Can process payments', category: 'finance' },
];

// Default permissions for each role
export const DEFAULT_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['*'], // Admin has all permissions
  manager: [
    'jobs.view.all',
    'jobs.create',
    'jobs.edit.all',
    'jobs.assign',
    'clients.view.all',
    'clients.create',
    'clients.edit',
    'estimates.view.all',
    'estimates.create',
    'estimates.edit',
    'estimates.send',
    'invoices.view.all',
    'invoices.create',
    'invoices.edit',
    'invoices.send',
    'products.view',
    'products.create',
    'products.edit',
    'schedule.view.all',
    'schedule.edit',
    'schedule.assign',
    'reports.view.all',
    'reports.create',
    'reports.export',
    'finance.view',
    'finance.edit',
    'finance.payments',
    'users.view',
  ],
  dispatcher: [
    'jobs.view.all',
    'jobs.create',
    'jobs.edit.all',
    'jobs.assign',
    'clients.view.all',
    'clients.create',
    'clients.edit',
    'estimates.view.all',
    'estimates.create',
    'estimates.edit',
    'estimates.send',
    'invoices.view.assigned',
    'products.view',
    'schedule.view.all',
    'schedule.edit',
    'schedule.assign',
    'reports.view.assigned',
  ],
  technician: [
    'jobs.view.assigned',
    'jobs.edit.assigned',
    'clients.view.assigned',
    'estimates.view.assigned',
    'invoices.view.assigned',
    'products.view',
    'schedule.view.own',
    'schedule.edit.own',
    'reports.view.own',
  ],
};
