export const ROUTES = {
  home:     '/home',
  signin:   '/signin',
  forgotPassword: '/signin/forgot-password',
  account:  '/account',
  public: {
    landing:  '/',
    about:    '/about',
    services: '/services',
    contact:  '/contact',
    demo:     '/demo',
  },
  homeInvoices: {
    detail: (type: string) => `/home/invoices/${type}`,
  },
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
        payments: (id: string) => `/finance/invoice/client/${id}/payments`,
      },
      company: {
        list: '/finance/invoice/company',
        create: '/finance/invoice/company/create',
        detail: (id: string) => `/finance/invoice/company/${id}`,
        payments: (id: string) => `/finance/invoice/company/${id}/payments`,
      },
      contractor: {
        list: '/finance/invoice/contractor',
        detail: (id: string | number) => `/finance/invoice/contractor/${id}`,
        payments: (id: string | number) => `/finance/invoice/contractor/${id}/payments`,
      },
      supplier: {
        list: '/finance/invoice/supplier',
        detail: (id: string) => `/finance/invoice/supplier/${id}`,
        payments: (id: string) => `/finance/invoice/supplier/${id}/payments`,
      },
    },
  },
  projects: {
    dashboard: '/projects/dashboard',
    new:       '/projects/new',
    sites:     '/projects/sites',
    siteDetail: (id: number | string) => `/projects/sites/${id}`,
  },
  permits: {
    all:              '/permits/all',
    create:           '/permits/create',
    myPendingPermits: '/permits/my-pending-permits',
    myPermits:        '/permits/my-permits',
  },
  workers: {
  dashboard: '/workers/dashboard',
  types: '/workers/types',
  siteWorkers: (siteId: number | string) => `/workers/site/${siteId}`,
  },
  logistics: {
    transport: {
      modeOfTransport: '/logistics/transport/mode-of-transport',
      vehicleCategory: '/logistics/transport/vehicle-category',
    },
    deliveries: {
      internals: '/logistics/deliveries/internals',
      externals: '/logistics/deliveries/externals',
    },
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
    siteDetail: (siteId: number | string) => `/quality/dashboard/${siteId}`,
    taskCreate: (siteId: number | string) => `/quality/dashboard/${siteId}/tasks/create`,
    taskDetail: (siteId: number | string, taskId: number | string) =>
      `/quality/dashboard/${siteId}/tasks/${taskId}`,
    subtaskCreate: (siteId: number | string, taskId: number | string) =>
      `/quality/dashboard/${siteId}/tasks/${taskId}/subtasks/create`,
  },
} as const;

export const AUTH_ROUTES = [
  ROUTES.signin,
  ROUTES.forgotPassword,
];

export const PUBLIC_ROUTES = [
  ROUTES.public.landing,
  ROUTES.public.about,
  ROUTES.public.services,
  ROUTES.public.contact,
  ROUTES.public.demo,
];

export const PROTECTED_PREFIX = [
  '/home',
  '/users',
  '/finance',
  '/workers',
  '/projects',
  '/store',
  '/department',
  '/account',
  '/logistics',
];