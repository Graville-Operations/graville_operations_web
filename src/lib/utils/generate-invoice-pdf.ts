/*
 * generate-invoice-pdf.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared PDF generation utility for all invoice types in Graville Ops.
 * Usage:
 *   import { generateInvoicePDF } from '@/lib/utils/generate-invoice-pdf';
 *   await generateInvoicePDF(invoice);
 *
 * Supported invoice types: client, company, supplier, contractor.
 * Each type can pass a different `invoiceType` label that appears in the PDF
 * header — everything else is driven by the shared InvoicePDFData shape.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type InvoiceType = 'Client' | 'Company' | 'Supplier' | 'Contractor';

export interface InvoicePDFItem {
  index:       number;
  particulars: string;
  quantity:    number;
  unitPrice:   number;
  totalAmount: number;
}

export interface InvoicePDFData {
  invoiceNo:   string;
  invoiceType: InvoiceType;
  clientName:  string;  
  invoiceDate: string;
  notes?:      string;
  createdBy:   string;        
  createdAt:   string;
  total:       number;
  items:       InvoicePDFItem[];
}

//  Colour pale
type RGB = [number, number, number];
const C: Record<string, RGB> = {
  brand:      [13,  90,  74],   
  brandLight: [20, 130, 108],  
  accent:     [0,  163, 137],  
  ink:        [15,  23,  42],   
  muted:      [71,  85, 105],   
  subtle:     [148,163, 184],   
  hairline:   [226,232, 240],   
  bg:         [248,250, 252],   
  white:      [255,255, 255],
};

//Main export
export async function generateInvoicePDF(data: InvoicePDFData): Promise<void> {
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const PW  = doc.internal.pageSize.getWidth();   
  const PH  = doc.internal.pageSize.getHeight();  
  const ML  = 48;          
  const MR  = PW - 48;     
  const CW  = MR - ML;   
  const fill   = (c: RGB)  => doc.setFillColor  (c[0], c[1], c[2]);
  const stroke = (c: RGB)  => doc.setDrawColor  (c[0], c[1], c[2]);
  const color  = (c: RGB)  => doc.setTextColor  (c[0], c[1], c[2]);
  const font   = (style: 'normal' | 'bold', size: number) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
  };
  const txt = (
    str:  string,
    x:    number,
    y:    number,
    opts?: { align?: 'left' | 'center' | 'right'; maxWidth?: number },
  ) => doc.text(str, x, y, opts as never);

  const hline = (x1: number, y1: number, x2: number, lw = 0.5) => {
    doc.setLineWidth(lw);
    doc.line(x1, y1, x2, y1);
  };
  fill(C.brand);
  doc.rect(0, 0, PW, 90, 'F');

  color(C.white);
  font('bold', 20);
  txt('GRAVILLE OPS', ML, 38);

  color([180, 220, 210]);
  font('normal', 9);
  txt('Construction Operations Management', ML, 52);

  color(C.white);
  font('bold', 26);
  txt(`${data.invoiceType.toUpperCase()} INVOICE`, MR, 36, { align: 'right' });

  color([180, 220, 210]);
  font('normal', 10);
  txt(data.invoiceNo ?? '', MR, 52, { align: 'right' });

  fill(C.accent);
  doc.rect(0, 90, PW, 3, 'F');

  let y = 122;

  fill(C.bg);
  doc.roundedRect(ML, y - 10, CW, 70, 4, 4, 'F');

  const colW = CW / 4;
  const cols = [ML, ML + colW, ML + colW * 2, ML + colW * 3];

  const metaField = (label: string, value: string, cx: number, cy: number) => {
    color(C.subtle);
    font('normal', 7.5);
    txt(label.toUpperCase(), cx + 10, cy);
    color(C.ink);
    font('bold', 10);
    txt(value || '—', cx + 10, cy + 14, { maxWidth: colW - 14 });
  };
  const billToLabel =
    data.invoiceType === 'Supplier'   ? 'Supplier'   :
    data.invoiceType === 'Contractor' ? 'Contractor' :
    data.invoiceType === 'Company'    ? 'Company'    : 'Bill To';

  metaField(billToLabel,    data.clientName,                              cols[0], y + 8);
  metaField('Invoice Date', data.invoiceDate ?? '—',                     cols[1], y + 8);
  metaField('Created By',   data.createdBy   ?? '—',                     cols[2], y + 8);
  metaField('Created At',   (data.createdAt  ?? '—').split('T')[0],      cols[3], y + 8);

  const totalY = y + 38;
  color(C.subtle);
  font('normal', 7.5);
  txt('AMOUNT DUE (KES)', cols[0] + 10, totalY);
  color(C.brandLight);
  font('bold', 16);
  txt(`KES ${(data.total ?? 0).toLocaleString()}`, cols[0] + 10, totalY + 16);

  y += 88;

  stroke(C.hairline);
  hline(ML, y, MR);
  y += 22;

  const TW = {
    idx:   30,
    qty:   50,
    up:    100,
    total: 90,
    get desc() { return CW - this.idx - this.qty - this.up - this.total; },
  };
  const TX = {
    idx:   ML,
    get desc()  { return ML + TW.idx; },
    get qty()   { return ML + TW.idx + TW.desc; },
    get up()    { return ML + TW.idx + TW.desc + TW.qty; },
    total: MR,
  };
  const ROW_H = 28;

  // Thead
  fill(C.brand);
  doc.rect(ML, y, CW, ROW_H, 'F');
  color(C.white);
  font('bold', 8);
  const hY = y + 18;
  txt('#',                TX.idx    + 2, hY);
  txt('PARTICULARS',      TX.desc   + 4, hY);
  txt('QTY',              TX.qty    + 4, hY);
  txt('UNIT PRICE (KES)', TX.up     + 4, hY);
  txt('TOTAL (KES)',      TX.total,      hY, { align: 'right' });
  y += ROW_H;

  const itemsPerPage = Math.floor((PH - y - 100) / ROW_H);
  let pageItemCount  = 0;

  data.items.forEach((item, i) => {
    if (pageItemCount > 0 && pageItemCount >= itemsPerPage) {
      doc.addPage();
      y             = 48;
      pageItemCount = 0;

      fill(C.brand);
      doc.rect(ML, y, CW, ROW_H, 'F');
      color(C.white);
      font('bold', 8);
      const hY2 = y + 18;
      txt('#',                TX.idx  + 2, hY2);
      txt('PARTICULARS',      TX.desc + 4, hY2);
      txt('QTY',              TX.qty  + 4, hY2);
      txt('UNIT PRICE (KES)', TX.up   + 4, hY2);
      txt('TOTAL (KES)',      TX.total,    hY2, { align: 'right' });
      y += ROW_H;
    }

    const rowY  = y + pageItemCount * ROW_H;
    const textY = rowY + 18;

    if (i % 2 === 0) { fill(C.bg); doc.rect(ML, rowY, CW, ROW_H, 'F'); }

    stroke(C.hairline);
    hline(ML, rowY + ROW_H, MR, 0.3);

    color(C.muted);  font('normal', 9);
    txt(String(item.index ?? i + 1), TX.idx + 2, textY);

    color(C.ink);    font('normal', 9);
    txt(item.particulars ?? '—', TX.desc + 4, textY, { maxWidth: TW.desc - 8 });

    color(C.muted);  font('normal', 9);
    txt(String(item.quantity ?? '—'),              TX.qty   + 4, textY);
    txt((item.unitPrice ?? 0).toLocaleString(),    TX.up    + 4, textY);

    color(C.brandLight); font('bold', 9);
    txt((item.totalAmount ?? 0).toLocaleString(),  TX.total,     textY, { align: 'right' });

    pageItemCount++;
  });

  y += pageItemCount * ROW_H;

  fill(C.ink);
  doc.rect(ML, y, CW, 34, 'F');
  color(C.subtle);
  font('normal', 8);
  txt('GRAND TOTAL', TX.up + 4, y + 14);
  color(C.white);
  font('bold', 13);
  txt(`KES ${(data.total ?? 0).toLocaleString()}`, TX.total, y + 22, { align: 'right' });

  y += 34;

  if (data.notes) {
    const NOTES_PAD_V = 10;
    const NOTES_PAD_H = 12;

    y += 10; 

    font('normal', 9);
    const wrappedLines = doc.splitTextToSize(data.notes, CW - NOTES_PAD_H * 2);
    const notesTextH   = wrappedLines.length * 12;
    const notesBoxH    = NOTES_PAD_V * 2 + 14 + notesTextH; // label + value

    fill(C.bg);
    doc.roundedRect(ML, y, CW, notesBoxH, 4, 4, 'F');

    color(C.subtle);
    font('normal', 7.5);
    txt('NOTES', ML + NOTES_PAD_H, y + NOTES_PAD_V + 8);

    color(C.muted);
    font('normal', 9);
    doc.text(wrappedLines, ML + NOTES_PAD_H, y + NOTES_PAD_V + 22);
  }

  const footerY = PH - 48;
  fill(C.accent);
  doc.rect(0, footerY, PW, 2, 'F');

  color(C.subtle);
  font('normal', 8);
  txt(
    'Generated by Graville Operations Management System',
    PW / 2, footerY + 16, { align: 'center' },
  );
  txt(
    `${data.invoiceType} Invoice: ${data.invoiceNo}  ·  ${new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })}`,
    PW / 2, footerY + 28, { align: 'center' },
  );
  doc.save(`${data.invoiceNo ?? 'invoice'}.pdf`);
}