export function parseList(data: unknown): any[] {
  if (Array.isArray(data)) return data;

  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;

    if (Array.isArray((d.data as any)?.items)) return (d.data as any).items;
    if (Array.isArray(d.data)) return d.data as any[];

    for (const key of ['items', 'results', 'list', 'records', 'rows', 'departments']) {
      if (Array.isArray(d[key])) return d[key] as any[];
    }
    for (const key of Object.keys(d)) {
      if (Array.isArray(d[key])) return d[key] as any[];
    }
  }

  return [];
}