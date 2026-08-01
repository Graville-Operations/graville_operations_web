import { unwrapArray } from '@/lib/api-response';
import { Menu, User } from '@/types/department-detail';

function extractMenusArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== 'object') return [];
  const inner = (raw as Record<string, unknown>).data;
  if (Array.isArray(inner)) return inner;
  if (inner && typeof inner === 'object') {
    const innerData = (inner as Record<string, unknown>).data;
    if (Array.isArray(innerData)) return innerData;
  }
  return [];
}

function toMenu(m: any): Menu {
  return {
    id: Number(m.id ?? m.menu_id ?? m.menuId ?? 0),
    name: String(m.name ?? m.menu_name ?? ''),
    title: String(m.title ?? m.label ?? m.name ?? m.menu_name ?? ''),
    link: m.link ?? m.url ?? m.path ?? undefined,
  };
}

function toUser(u: any): User {
  const src = u?.user ?? u?.member ?? u;
  return {
    id: Number(src.id ?? src.user_id ?? src.userId ?? u.user_id ?? u.userId ?? u.id ?? 0),
    name: String(
      (src.name ?? src.full_name ?? src.fullName ??
        `${src.first_name ?? src.firstName ?? ''} ${src.last_name ?? src.lastName ?? ''}`.trim()) ||
      'Unknown',
    ),
    email: String(src.email ?? src.email_address ?? u.email ?? ''),
    role: String(src.role ?? src.job_title ?? src.jobTitle ?? src.position ?? src.phone ?? u.role ?? ''),
  };
}

export function parseMenus(raw: unknown): Menu[] {
  return extractMenusArray(raw).map(toMenu).filter((m) => m.id > 0);
}

export function parseUsers(raw: unknown, tag = ''): User[] {
  const arr = unwrapArray<any>(raw);
  if (process.env.NODE_ENV !== 'production' && arr.length === 0) {
    console.warn(`[parseUsers${tag ? ' ' + tag : ''}] got 0 items from:`, JSON.stringify(raw).slice(0, 250));
  }
  return arr.map(toUser).filter((u) => u.id > 0 || u.email);
}