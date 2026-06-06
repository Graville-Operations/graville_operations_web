export const ROUTES = {
  home:     '/home',
  signin:   '/signin',
  account:  '/account',
  users: {
    dashboard: '/users/dashboard',
    new:    '/users/new',
    roles:  '/users/roles',
    assign: '/users/roles/assign',
    reports:'/users/reports',
    imports:'/users/import',
  },
  finance: {
    home:     '/finance',
    invoices: '/finance/invoices/supplier',
    new:      '/finance/invoices/new',
  },
  projects: {
    dashboard: '/projects/dashboard',
    new:       '/projects/new',
  },
  workers:    '/workers',
  store:      '/store',
  department: '/department',
} as const;