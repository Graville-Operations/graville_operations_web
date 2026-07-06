export interface SubSubMenu {
  id: number;
  name: string;
  title: string;
  link?: string | null;
  order: number;
}

export interface SubMenu {
  id: number;
  name: string;
  title: string;
  link?: string | null;
  order: number;
  subsubmenus?: SubSubMenu[];
}

export interface Menu {
  id: number;
  name: string;
  title: string;
  link?: string | null;
  order: number;
  submenus?: SubMenu[];
}

export type ModalType =
  | { type: 'menu-create' }
  | { type: 'menu-edit'; menu: Menu }
  | { type: 'submenu-create'; menuId: number }
  | { type: 'submenu-edit'; submenu: SubMenu; menuId: number }
  | { type: 'subsubmenu-create'; submenuId: number }
  | { type: 'subsubmenu-edit'; subsubmenu: SubSubMenu; submenuId: number }
  | null;

export interface MenuFormData {
  name: string;
  title: string;
  link: string;
  order: string;
}

export interface MenuPayload {
  name: string;
  title: string;
  link: string | null;
  order: number;
}