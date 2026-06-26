export interface Site {
  id: number;
  name: string;
}

// id -> Site, O(1) lookup
const _siteMap: Record<number, Site> = {};
let _loaded = false;

export function setSites(sites: Site[]): void {
  sites.forEach((s) => { _siteMap[s.id] = s; });
  _loaded = true;
}

export function getSite(id: number): Site | undefined {
  return _siteMap[id];
}

export function getAllSites(): Site[] {
  return Object.values(_siteMap);
}

export function sitesLoaded(): boolean {
  return _loaded;
}