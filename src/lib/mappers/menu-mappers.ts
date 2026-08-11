import type {
  Menu,
  MenuDTO,
  SubMenu,
  SubMenuDTO,
  SubSubMenu,
  SubSubMenuDTO,
} from '@/types/menu';

export function normaliseSubSubMenu(dto: SubSubMenuDTO): SubSubMenu {
  return {
    id: dto.id,
    name: dto.name ?? '',
    title: dto.title ?? '',
    link: dto.link ?? null,
    icon: dto.icon ?? undefined,
    order: dto.order ?? 0,
  };
}

export function normaliseSubMenu(dto: SubMenuDTO): SubMenu {
  return {
    id: dto.id,
    name: dto.name ?? '',
    title: dto.title ?? '',
    link: dto.link ?? null,
    icon: dto.icon ?? undefined,
    order: dto.order ?? 0,
    subsubmenus: (dto.subsubmenus ?? []).map(normaliseSubSubMenu),
  };
}

export function normaliseMenu(dto: MenuDTO): Menu {
  return {
    id: dto.id,
    name: dto.name ?? '',
    title: dto.title ?? '',
    link: dto.link ?? null,
    icon: dto.icon ?? undefined,
    order: dto.order ?? 0,
    submenus: (dto.submenus ?? []).map(normaliseSubMenu),
  };
}

export function normaliseMenus(dtos: MenuDTO[]): Menu[] {
  return dtos.map(normaliseMenu);
}