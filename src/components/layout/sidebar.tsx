// 'use client';

// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import { useAuthStore } from '@/store/auth-store';
// import {
//   Home, Users, BarChart2, Briefcase, FolderOpen,
//   LogOut, ChevronRight, Building2
// } from 'lucide-react';

// const navItems = [
//   { label: 'Home', href: '/home', icon: Home, roles: ['ADMIN', 'FINANCE', 'AUDITOR', 'FOREMAN'] },
//   { label: 'Workers', href: '/workers', icon: Users, roles: ['ADMIN', 'FOREMAN'] },
//   { label: 'Finance', href: '/finance', icon: BarChart2, roles: ['ADMIN', 'FINANCE'] },
//   { label: 'Invoices', href: '/finance/invoices', icon: Briefcase, roles: ['ADMIN', 'FINANCE'] },
//   { label: 'Projects', href: '/projects', icon: FolderOpen, roles: ['ADMIN'] },
//   { label: 'Users', href: '/users', icon: Building2, roles: ['ADMIN'] },
// ];

// export default function Sidebar() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const { user, role, logout } = useAuthStore();

//   const handleLogout = () => {
//     logout();
//     router.push('/login');
//   };

//   const visibleItems = navItems.filter(
//     (item) => !role || item.roles.includes(role.toUpperCase())
//   );

//   return (
//     <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
//       {/* Logo */}
//       <div className="p-6 border-b border-gray-100">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 bg-[#33907C] rounded-xl flex items-center justify-center">
//             <span className="text-white font-bold text-lg">G</span>
//           </div>
//           <div>
//             <p className="font-bold text-gray-800 text-sm">Graville Ops</p>
//             <p className="text-xs text-gray-400">Management System</p>
//           </div>
//         </div>
//       </div>

//       {/* Nav */}
//       <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
//         {visibleItems.map((item) => {
//           const Icon = item.icon;
//           const isActive = pathname === item.href ||
//             (item.href !== '/home' && pathname.startsWith(item.href));
//           return (
//             <Link
//               key={item.href}
//               href={item.href}
//               className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
//                 isActive
//                   ? 'bg-[#33907C] text-white'
//                   : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//               }`}
//             >
//               <Icon size={18} />
//               <span className="flex-1">{item.label}</span>
//               {isActive && <ChevronRight size={14} />}
//             </Link>
//           );
//         })}
//       </nav>

//       {/* User & Logout */}
//       <div className="p-4 border-t border-gray-100">
//         <div className="flex items-center gap-3 px-4 py-3 mb-2">
//           <div className="w-8 h-8 bg-[#33907C] rounded-full flex items-center justify-center">
//             <span className="text-white text-xs font-bold">
//               {user?.first_name?.[0]}{user?.last_name?.[0]}
//             </span>
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="text-sm font-medium text-gray-800 truncate">
//               {user?.first_name} {user?.last_name}
//             </p>
//             <p className="text-xs text-gray-400 truncate">{role}</p>
//           </div>
//         </div>
//         <button
//           onClick={handleLogout}
//           className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
//         >
//           <LogOut size={18} />
//           Logout
//         </button>
//       </div>
//     </aside>
//   );
// }