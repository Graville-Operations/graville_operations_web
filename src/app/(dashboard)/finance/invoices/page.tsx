'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Invoice, InvoiceResponse } from '@/types/invoice';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredInvoice, setHoveredInvoice] = useState<number | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.get<InvoiceResponse>('/invoices');
      setInvoices(response.data.data.items);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading invoices...
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Invoices
        </h1>

        <p className="text-gray-500 mt-1">
          Hover on an invoice to view details
        </p>
      </div>

      <div className="space-y-4">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="relative"
            onMouseEnter={() => setHoveredInvoice(invoice.id)}
            onMouseLeave={() => setHoveredInvoice(null)}
          >
            {/* Invoice Row */}
            <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {invoice.invoiceNo}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {invoice.supplierName}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-sm text-gray-500">
                    Total Amount
                  </p>

                  <h3 className="text-lg font-bold text-green-600">
                    KES {invoice.total.toLocaleString()}
                  </h3>
                </div>
              </div>
            </div>

            {/* Hover Card */}
            {hoveredInvoice === invoice.id && (
              <div className="absolute z-50 mt-2 w-full bg-white border rounded-2xl shadow-2xl p-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">
                      Supplier Name
                    </p>

                    <p className="font-semibold">
                      {invoice.supplierName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Invoice Number
                    </p>

                    <p className="font-semibold">
                      {invoice.invoiceNo}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Delivery Number
                    </p>

                    <p className="font-semibold">
                      {invoice.deliveryNo}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      LPO Number
                    </p>

                    <p className="font-semibold">
                      {invoice.lpoNo}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Invoice Date
                    </p>

                    <p className="font-semibold">
                      {new Date(
                        invoice.invoiceDate
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Submitted By
                    </p>

                    <p className="font-semibold">
                      {invoice.createdBy.name}
                    </p>
                  </div>
                </div>

                {/* Materials */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">
                    Materials
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 text-left">
                            Material
                          </th>

                          <th className="p-3 text-left">
                            Quantity
                          </th>

                          <th className="p-3 text-left">
                            Unit Price
                          </th>

                          <th className="p-3 text-left">
                            Total
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {invoice.items.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b"
                          >
                            <td className="p-3">
                              {item.materialName}
                            </td>

                            <td className="p-3">
                              {item.quantity}
                            </td>

                            <td className="p-3">
                              KES{' '}
                              {item.unitPrice.toLocaleString()}
                            </td>

                            <td className="p-3 font-medium">
                              KES{' '}
                              {item.totalMaterialPrice.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-2">
                      Notes
                    </h3>

                    <p className="text-gray-600">
                      {invoice.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}