export interface SubSubMenu {
  id: number;
  name: string;
  title: string;
  link?: string | null;
  icon?: string;
  order: number;
}

export interface SubSubMenuDTO {
  id: number;
  name?: string;
  title?: string;
  link?: string | null;
  icon?: string | null;
  order?: number;
}

export interface SubMenu {
  id: number;
  name: string;
  title: string;
  link?: string | null;
  icon?: string;
  order: number;
  subsubmenus: SubSubMenu[];
}

export interface SubMenuDTO {
  id: number;
  name?: string;
  title?: string;
  link?: string | null;
  icon?: string | null;
  order?: number;
  subsubmenus?: SubSubMenuDTO[];
}

export interface Menu {
  id: number;
  name: string;
  title: string;
  link?: string | null;
  icon?: string;
  order: number;
  submenus: SubMenu[];
}

export interface MenuDTO {
  id: number;
  name?: string;
  title?: string;
  link?: string | null;
  icon?: string | null;
  order?: number;
  submenus?: SubMenuDTO[];
}

export type MenuItem = Menu;

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