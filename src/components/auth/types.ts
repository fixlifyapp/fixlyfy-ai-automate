export type UserRole = 'admin' | 'technician' | 'dispatcher' | 'manager';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'jobs' | 'invoices' | 'estimates' | 'products' | 'users' | 'settings' | 'reports';
}

export interface RolePermissions {
  role: UserRole;
  permissions: string[]; // Permission IDs
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

// Default permissions per role
export const DEFAULT_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['*'], // Wildcard for all permissions
  technician: [
    'jobs.view.own',
    'jobs.edit.own',
    'estimates.create.own',
    'estimates.edit.own',
    'invoices.create.own',
    'invoices.edit.own',
    'payments.log',
  ],
  dispatcher: [
    'jobs.view.all',
    'jobs.assign',
    'jobs.schedule',
    'jobs.reschedule',
    'technicians.locate',
  ],
  manager: [
    'jobs.view.all',
    'jobs.edit.all',
    'estimates.approve',
    'invoices.approve',
    'discounts.approve',
    'reports.view',
    'insights.view',
  ],
};

export const PERMISSIONS_LIST: Permission[] = [
  // Jobs
  { id: 'jobs.view.all', name: 'View All Jobs', description: 'Can view all jobs in the system', category: 'jobs' },
  { id: 'jobs.view.own', name: 'View Own Jobs', description: 'Can view only assigned jobs', category: 'jobs' },
  { id: 'jobs.edit.all', name: 'Edit All Jobs', description: 'Can edit any job', category: 'jobs' },
  { id: 'jobs.edit.own', name: 'Edit Own Jobs', description: 'Can edit only assigned jobs', category: 'jobs' },
  { id: 'jobs.delete', name: 'Delete Jobs', description: 'Can delete jobs', category: 'jobs' },
  { id: 'jobs.assign', name: 'Assign Jobs', description: 'Can assign jobs to technicians', category: 'jobs' },
  { id: 'jobs.schedule', name: 'Schedule Jobs', description: 'Can schedule jobs', category: 'jobs' },
  { id: 'jobs.reschedule', name: 'Reschedule Jobs', description: 'Can reschedule jobs', category: 'jobs' },
  
  // Estimates
  { id: 'estimates.view.all', name: 'View All Estimates', description: 'Can view all estimates', category: 'estimates' },
  { id: 'estimates.view.own', name: 'View Own Estimates', description: 'Can view own estimates', category: 'estimates' },
  { id: 'estimates.create.all', name: 'Create All Estimates', description: 'Can create estimates for any job', category: 'estimates' },
  { id: 'estimates.create.own', name: 'Create Own Estimates', description: 'Can create estimates for own jobs', category: 'estimates' },
  { id: 'estimates.edit.all', name: 'Edit All Estimates', description: 'Can edit any estimate', category: 'estimates' },
  { id: 'estimates.edit.own', name: 'Edit Own Estimates', description: 'Can edit own estimates', category: 'estimates' },
  { id: 'estimates.approve', name: 'Approve Estimates', description: 'Can approve estimates', category: 'estimates' },
  { id: 'estimates.delete', name: 'Delete Estimates', description: 'Can delete estimates', category: 'estimates' },
  
  // Invoices
  { id: 'invoices.view.all', name: 'View All Invoices', description: 'Can view all invoices', category: 'invoices' },
  { id: 'invoices.view.own', name: 'View Own Invoices', description: 'Can view own invoices', category: 'invoices' },
  { id: 'invoices.create.all', name: 'Create All Invoices', description: 'Can create invoices for any job', category: 'invoices' },
  { id: 'invoices.create.own', name: 'Create Own Invoices', description: 'Can create invoices for own jobs', category: 'invoices' },
  { id: 'invoices.edit.all', name: 'Edit All Invoices', description: 'Can edit any invoice', category: 'invoices' },
  { id: 'invoices.edit.own', name: 'Edit Own Invoices', description: 'Can edit own invoices', category: 'invoices' },
  { id: 'invoices.approve', name: 'Approve Invoices', description: 'Can approve invoices', category: 'invoices' },
  { id: 'invoices.delete', name: 'Delete Invoices', description: 'Can delete invoices', category: 'invoices' },
  
  // Products
  { id: 'products.view', name: 'View Products', description: 'Can view product catalog', category: 'products' },
  { id: 'products.create', name: 'Create Products', description: 'Can create new products', category: 'products' },
  { id: 'products.edit', name: 'Edit Products', description: 'Can edit product details', category: 'products' },
  { id: 'products.delete', name: 'Delete Products', description: 'Can delete products', category: 'products' },
  { id: 'products.prices.edit', name: 'Edit Product Prices', description: 'Can edit product prices', category: 'products' },
  
  // Users
  { id: 'users.view', name: 'View Users', description: 'Can view users', category: 'users' },
  { id: 'users.create', name: 'Create Users', description: 'Can create new users', category: 'users' },
  { id: 'users.edit', name: 'Edit Users', description: 'Can edit user details', category: 'users' },
  { id: 'users.delete', name: 'Delete Users', description: 'Can delete users', category: 'users' },
  { id: 'users.roles.assign', name: 'Assign User Roles', description: 'Can assign roles to users', category: 'users' },
  
  // Settings
  { id: 'settings.view', name: 'View Settings', description: 'Can view system settings', category: 'settings' },
  { id: 'settings.edit', name: 'Edit Settings', description: 'Can edit system settings', category: 'settings' },
  
  // Reports
  { id: 'reports.view', name: 'View Reports', description: 'Can view reports', category: 'reports' },
  { id: 'reports.create', name: 'Create Reports', description: 'Can create custom reports', category: 'reports' },
  
  // Other
  { id: 'payments.log', name: 'Log Payments', description: 'Can log payments', category: 'invoices' },
  { id: 'discounts.approve', name: 'Approve Discounts', description: 'Can approve discounts', category: 'invoices' },
  { id: 'insights.view', name: 'View Insights', description: 'Can view AI insights', category: 'reports' },
  { id: 'technicians.locate', name: 'Locate Technicians', description: 'Can locate technicians', category: 'jobs' },
];
