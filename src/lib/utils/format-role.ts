export const formatRole = (role?: string) =>
  role
    ? role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : '';