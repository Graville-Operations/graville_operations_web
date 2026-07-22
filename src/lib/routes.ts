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
    home: '/finance',
    templates: '/finance/templates',
    invoice: {
      client: {
        list: '/finance/invoice/client',
        new:  '/finance/invoice/client/new',
        detail: (id: string) => `/finance/invoice/client/${id}`,
      },
      company: {
        list: '/finance/invoice/company',
        create: '/finance/invoice/company/create',
        detail: (id: string) => `/finance/invoice/company/${id}`,
      },
      contractor: '/finance/invoice/contractor',
      supplier: {
        list: '/finance/invoice/supplier',
        detail: (id: string) => `/finance/invoice/supplier/${id}`,
      },
    },
  },
  projects: {
    dashboard: '/projects/dashboard',
    new:       '/projects/new',
    sites:     '/projects/sites',
  },
  permits: {
    all:              '/permits/all',
    create:           '/permits/create',
    myPendingPermits: '/permits/my-pending-permits',
    myPermits:        '/permits/my-permits',
  },
  workers: {
    dashboard: '/workers/dashboard',
  },
  sections: {
    departments: {
      list: '/sections/departments',
      detail: (id: string) => `/sections/departments/${id}`,
    },
    menus: '/sections/menus',
  },
  stores: {
    dashboard: '/stores/dasboard',
    materials: {
      detail: (siteId: string) => `/stores/materials/${siteId}`,
    },
    tools: {
      detail: (siteId: string) => `/stores/tools/${siteId}`,
    },
    orders: {
      list: '/stores/orders',
      detail: (usageId: string) => `/stores/orders/${usageId}`,
    },
    stocks: '/stores/stocks',
  },
  quality: {
    dashboard: '/quality/dashboard',
    taskDetail: (id: string) => `/quality/dashboard/tasks/${id}`,
    taskCreate: '/quality/dashboard/tasks/create',
    subtaskCreate: (taskId: string) => `/quality/dashboard/tasks/${taskId}/subtasks/create`,
  },
} as const;