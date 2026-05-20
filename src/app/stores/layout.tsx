import { ReactNode } from 'react';

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="gv-page px-6 py-8 max-w-7xl mx-auto">
      {children}
    </div>
  );
}