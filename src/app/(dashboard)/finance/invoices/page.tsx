// 'use client';

// import { useState, useEffect } from 'react';
// import api from '@/lib/api';
// import { Invoice } from '@/types';
// import { Search, Eye } from 'lucide-react';

// const statusColors: Record<string, string> = {
//   PENDING: 'bg-yellow-100 text-yellow-700',
//   APPROVED: 'bg-blue-100 text-blue-700',
//   REJECTED: 'bg-red-100 text-red-700',
//   PARTIALLY_PAID: 'bg-orange-100 text-orange-700',
//   FULLY_PAID: 'bg-green-100 text-green-700',
// };

// export default function InvoicesPage() {
//   const [invoices, setInvoices] = useState<Invoice[]>([]);
//   const [filtered, setFiltered] = useState<Invoice[]>([]);
//   const [search, setSearch] = useState('');
//   const [isLoading, setIsLoading] = useState(true);
//   const [selected, setSelected] = useState<Invoice | null>(null);

//   useEffect(() => { fetchInvoices(); }, []);

//   useEffect(() => {
//     const q = search.toLowerCase();
//     setFiltered(invoices.filter((i) =>
//       i.invoice_number.toLowerCase().includes(q) ||
//       i.supplier_name.toLowerCase().includes(q) ||
//       (i.submitted_by ?? '').toLowerCase().includes(q) ||
//       (i.site ?? '').toLowerCase().includes(q) ||
//       i.status.toLowerCase().includes(q)
//     ));
//   }, [search, invoices]);

//   const fetchInvoices = async () => {
//     try {
//       setIsLoading(true);
//       const { data } = await api.get('/invoices/');
//       setInvoices(data);
//       setFiltered(data);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-xl font-bold text-gray-800">Invoices</h2>
//           <p className="text-sm text-gray-500">{filtered.length} invoices</p>
//         </div>
//       </div>

//       {/* Search */}
//       <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
//         <div className="relative">
//           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search by invoice no, supplier, site, status..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33907C] text-sm"
//           />
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//         {isLoading ? (
//           <div className="flex items-center justify-center h-48">
//             <div className="w-6 h-6 border-2 border-[#33907C] border-t-transparent rounded-full animate-spin" />
//           </div>
//         ) : (
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-100">
//               <tr>
//                 {['Invoice No', 'Supplier', 'Site', 'Submitted By', 'Amount', 'Paid', 'Status', ''].map((h) => (
//                   <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-50">
//               {filtered.map((inv) => (
//                 <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-4 py-3 text-sm font-medium text-gray-800">{inv.invoice_number}</td>
//                   <td className="px-4 py-3 text-sm text-gray-600">{inv.supplier_name}</td>
//                   <td className="px-4 py-3 text-sm text-gray-600">{inv.site ?? '—'}</td>
//                   <td className="px-4 py-3 text-sm text-gray-600">{inv.submitted_by ?? '—'}</td>
//                   <td className="px-4 py-3 text-sm font-medium text-gray-800">
//                     KES {inv.total_amount.toLocaleString()}
//                   </td>
//                   <td className="px-4 py-3 text-sm text-gray-600">
//                     KES {inv.amount_paid.toLocaleString()}
//                   </td>
//                   <td className="px-4 py-3">
//                     <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[inv.status] ?? 'bg-gray-100 text-gray-600'}`}>
//                       {inv.status.replace('_', ' ')}
//                     </span>
//                   </td>
//                   <td className="px-4 py-3">
//                     <button
//                       onClick={() => setSelected(inv)}
//                       className="p-2 text-[#33907C] hover:bg-green-50 rounded-lg transition-colors"
//                     >
//                       <Eye size={16} />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* Invoice Detail Modal */}
//       {selected && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             <div className="p-6 border-b border-gray-100 flex items-center justify-between">
//               <h3 className="font-bold text-gray-800">Invoice #{selected.invoice_number}</h3>
//               <button
//                 onClick={() => setSelected(null)}
//                 className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
//               >
//                 ×
//               </button>
//             </div>
//             <div className="p-6 space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 {[
//                   { label: 'Supplier', value: selected.supplier_name },
//                   { label: 'LPO Number', value: selected.lpo_number },
//                   { label: 'Delivery Number', value: selected.delivery_number },
//                   { label: 'Invoice Date', value: new Date(selected.invoice_date).toLocaleDateString() },
//                   { label: 'Site', value: selected.site ?? '—' },
//                   { label: 'Submitted By', value: selected.submitted_by ?? '—' },
//                   { label: 'Submitted On', value: selected.created_at ? new Date(selected.created_at).toLocaleDateString() : '—' },
//                   { label: 'Status', value: selected.status.replace('_', ' ') },
//                 ].map(({ label, value }) => (
//                   <div key={label}>
//                     <p className="text-xs text-gray-400 uppercase font-semibold">{label}</p>
//                     <p className="text-sm font-medium text-gray-800 mt-1">{value}</p>
//                   </div>
//                 ))}
//               </div>

//               {/* Items */}
//               {selected.items && selected.items.length > 0 && (
//                 <div>
//                   <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Items</p>
//                   <table className="w-full text-sm">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         {['Particular', 'Qty', 'Unit Price', 'Total'].map((h) => (
//                           <th key={h} className="px-3 py-2 text-left text-xs text-gray-500">{h}</th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {selected.items.map((item, i) => (
//                         <tr key={i} className="border-t border-gray-50">
//                           <td className="px-3 py-2">{item.particular}</td>
//                           <td className="px-3 py-2">{item.quantity}</td>
//                           <td className="px-3 py-2">KES {item.unit_price.toLocaleString()}</td>
//                           <td className="px-3 py-2 font-medium text-[#33907C]">KES {item.total_price.toLocaleString()}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}

//               {/* Totals */}
//               <div className="bg-gray-50 rounded-xl p-4 space-y-2">
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Total Amount</span>
//                   <span className="font-bold text-gray-800">KES {selected.total_amount.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Amount Paid</span>
//                   <span className="font-bold text-green-600">KES {selected.amount_paid.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
//                   <span className="text-gray-600">Balance</span>
//                   <span className="font-bold text-red-600">
//                     KES {(selected.total_amount - selected.amount_paid).toLocaleString()}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }