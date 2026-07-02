import { RefObject } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Site } from '@/types';

interface SiteFilterDropdownProps {
  siteRef: RefObject<HTMLDivElement | null>;
  sites: Site[];
  selectedSite: Site | null;
  siteOpen: boolean;
  onToggle: () => void;
  onSelect: (site: Site | null) => void;
}

export function SiteFilterDropdown({ siteRef, sites, selectedSite, siteOpen, onToggle, onSelect }: SiteFilterDropdownProps) {
  return (
    <div className="relative shrink-0" ref={siteRef}>
      <div className="flex items-center gap-1">
        <button
          onClick={onToggle}
          className={`gv-btn-pill gap-2 ${selectedSite ? 'gv-pill-active' : ''}`}
        >
          <span>{selectedSite ? selectedSite.name : 'All Sites'}</span>
          <ChevronDown
            size={13}
            style={{ transform: siteOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          />
        </button>
        {selectedSite && (
          <button
            onClick={() => onSelect(null)}
            className="p-1 rounded-full transition-colors hover:bg-white/10"
            style={{ color: 'var(--gv-text-faint)' }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {siteOpen && (
        <div className="gv-dropdown" style={{ width: '15rem', left: 'auto', right: 0 }}>
          <p className="px-4 pt-3 pb-2 text-xs font-semibold uppercase tracking-widest"
             style={{ color: 'var(--gv-text-subtle)' }}>
            Site
          </p>
          <div style={{ maxHeight: '14rem', overflowY: 'auto' }}>
            <button
              onClick={() => onSelect(null)}
              className={`gv-dropdown-item ${!selectedSite ? 'gv-dropdown-item--active' : ''}`}
            >
              All Sites
            </button>
            {sites.length === 0 ? (
              <p className="px-4 py-2 text-xs" style={{ color: 'var(--gv-text-faint)' }}>
                No sites found
              </p>
            ) : (
              sites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => onSelect(site)}
                  className={`gv-dropdown-item ${selectedSite?.id === site.id ? 'gv-dropdown-item--active' : ''}`}
                >
                  {site.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}