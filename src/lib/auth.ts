import Cookies from 'js-cookie';

export const TOKEN_KEY = 'graville_token';
export const ROLE_KEY = 'graville_role';
export const USER_KEY = 'graville_user';

export const saveToken = (token: string) => Cookies.set(TOKEN_KEY, token, { expires: 7 });
export const getToken = () => Cookies.get(TOKEN_KEY);
export const removeToken = () => Cookies.remove(TOKEN_KEY);

export const saveRole = (role: string) => Cookies.set(ROLE_KEY, role, { expires: 7 });
export const getRole = () => Cookies.get(ROLE_KEY);

export const saveUser = (user: object) =>
  Cookies.set(USER_KEY, JSON.stringify(user), { expires: 7 });
export const getUser = () => {
  const u = Cookies.get(USER_KEY);
  return u ? JSON.parse(u) : null;
};

export const clearSession = () => {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(ROLE_KEY);
  Cookies.remove(USER_KEY);
};

export const isAuthenticated = () => !!getToken();