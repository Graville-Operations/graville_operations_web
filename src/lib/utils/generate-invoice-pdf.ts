
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

type RGB = [number, number, number];
const C: Record<string, RGB> = {
  brand:      [51,  144, 124],  
  brandLight: [220, 241, 238],   
  brandBorder:[160, 210, 200],   
  ink:        [26,   26,  46],  
  muted:      [85,   85,  85],   
  subtle:     [140, 140, 140],   
  hairline:   [210, 210, 210],   
  bg:         [248, 250, 252],   
  white:      [255, 255, 255],
  black:      [0,     0,   0],
};

export async function generateInvoicePDF(data: InvoicePDFData): Promise<void> {
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const PW  = doc.internal.pageSize.getWidth();
  const PH  = doc.internal.pageSize.getHeight();
  const ML  = 48;
  const MR  = PW - 48;
  const CW  = MR - ML;

  const fill   = (c: RGB) => doc.setFillColor  (c[0], c[1], c[2]);
  const stroke = (c: RGB) => doc.setDrawColor  (c[0], c[1], c[2]);
  const color  = (c: RGB) => doc.setTextColor  (c[0], c[1], c[2]);
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

  const drawPageHeader = () => {
    fill(C.white);
    doc.rect(0, 0, PW, 90, 'F');

    // Green left stripe
    fill(C.brand);
    doc.rect(0, 0, 4, 90, 'F');

    color(C.ink);
    font('bold', 20);
    txt('GRAVILLE ENTERPRISES', ML, 36);

    color(C.muted);
    font('normal', 9);
    txt('Operations Management System', ML, 50);

    color(C.ink);
    font('bold', 22);
    txt(`${data.invoiceType.toUpperCase()} INVOICE`, MR, 32, { align: 'right' });

    color(C.muted);
    font('normal', 10);
    txt(data.invoiceNo ?? '', MR, 48, { align: 'right' });

    stroke(C.brand);
    hline(ML, 90, MR, 1.5);
  };

  const drawPageFooter = (pageNum: number, totalPages: number) => {
    const footerY = PH - 30;
    stroke(C.hairline);
    hline(ML, footerY, MR, 0.5);

    color(C.subtle);
    font('normal', 8);
    txt(
      `${data.invoiceType} Invoice · ${data.invoiceNo}`,
      ML, footerY + 14,
    );
    txt(
      `Page ${pageNum} of ${totalPages}`,
      MR, footerY + 14, { align: 'right' },
    );
  };
  drawPageHeader();
  let y = 108;

  const META_H = 90;
  fill(C.brandLight);
  doc.roundedRect(ML, y, CW, META_H, 5, 5, 'F');
  stroke(C.brandBorder);
  doc.setLineWidth(0.8);
  doc.roundedRect(ML, y, CW, META_H, 5, 5, 'S');

  fill(C.brand);
  doc.roundedRect(ML, y, 4, META_H, 2, 2, 'F');

  const colW = CW / 4;
  const cols = [ML, ML + colW, ML + colW * 2, ML + colW * 3];
  const PAD  = 12;

  const metaField = (label: string, value: string, cx: number, cy: number) => {
    color(C.brand);
    font('normal', 7);
    txt(label.toUpperCase(), cx + PAD, cy);
    color(C.ink);
    font('bold', 9.5);
    txt(value || '—', cx + PAD, cy + 13, { maxWidth: colW - PAD - 4 });
  };

  const billToLabel =
    data.invoiceType === 'Supplier'   ? 'Supplier'   :
    data.invoiceType === 'Contractor' ? 'Contractor' :
    data.invoiceType === 'Company'    ? 'Company'    : 'Bill To';

  metaField(billToLabel,    data.clientName,                          cols[0], y + 18);
  metaField('Invoice Date', data.invoiceDate ?? '—',                  cols[1], y + 18);
  metaField('Created By',   data.createdBy   ?? '—',                  cols[2], y + 18);
  metaField('Created At',   (data.createdAt  ?? '—').split('T')[0],   cols[3], y + 18);

  stroke(C.brandBorder);
  doc.setLineWidth(0.4);
  hline(ML + 8, y + 46, MR - 8, 0.4);

  color(C.brand);
  font('normal', 7);
  txt('AMOUNT DUE (KES)', cols[0] + PAD, y + 60);
  color(C.brand);
  font('bold', 14);
  txt(`KES ${(data.total ?? 0).toLocaleString()}`, cols[0] + PAD, y + 75);

  y += META_H + 20;
  const TW = {
    idx:   28,
    qty:   46,
    up:    96,
    total: 88,
    get desc() { return CW - this.idx - this.qty - this.up - this.total; },
  };
  const TX = {
    idx:   ML,
    get desc()  { return ML + TW.idx; },
    get qty()   { return ML + TW.idx + TW.desc; },
    get up()    { return ML + TW.idx + TW.desc + TW.qty; },
    total: MR,
  };
  const ROW_H      = 28;
  const USABLE_H   = PH - 90 - 50;   
  const itemsPage1 = Math.floor((PH - y - 50 - 30) / ROW_H); 

  const totalItems = data.items.length;
  let   pagesNeeded = 1;
  {
    const remaining = itemsPage1;
    let left      = totalItems;
    if (left <= remaining) {
      pagesNeeded = 1;
    } else {
      left -= remaining;
      pagesNeeded++;
      const perPage = Math.floor((USABLE_H - ROW_H /* thead */) / ROW_H);
      pagesNeeded  += Math.ceil(left / perPage);
    }
  }

  const drawTableHead = (ty: number) => {
    fill(C.white);
    doc.rect(ML, ty, CW, ROW_H, 'F');
    stroke(C.brand);
    hline(ML, ty,          MR, 1.5);
    hline(ML, ty + ROW_H, MR, 1.5);
    color(C.brand);
    font('bold', 8);
    const hY = ty + 18;
    txt('#',                TX.idx    + 2, hY);
    txt('PARTICULARS',      TX.desc   + 4, hY);
    txt('QTY',              TX.qty    + 4, hY);
    txt('UNIT PRICE (KES)', TX.up     + 4, hY);
    txt('TOTAL (KES)',      TX.total,      hY, { align: 'right' });
  };

  drawTableHead(y);
  y += ROW_H;

  let pageNum       = 1;
  let pageItemCount = 0;
  let maxOnThisPage = itemsPage1;

  data.items.forEach((item, i) => {
    // Page break check
    if (pageItemCount >= maxOnThisPage) {
      // Footer current page
      drawPageFooter(pageNum, pagesNeeded);

      doc.addPage();
      pageNum++;
      drawPageHeader();
      y             = 108;
      pageItemCount = 0;
      maxOnThisPage = Math.floor((USABLE_H - ROW_H) / ROW_H);

      drawTableHead(y);
      y += ROW_H;
    }

    const rowY  = y + pageItemCount * ROW_H;
    const textY = rowY + 18;

    // White row background
    fill(C.white);
    doc.rect(ML, rowY, CW, ROW_H, 'F');

    // Subtle hairline separator between rows
    stroke(C.hairline);
    doc.setLineWidth(0.35);
    hline(ML, rowY + ROW_H, MR, 0.35);

    color(C.subtle);  font('normal', 9);
    txt(String(item.index ?? i + 1),           TX.idx  + 2, textY);

    color(C.ink);     font('normal', 9);
    txt(item.particulars ?? '—',               TX.desc + 4, textY, { maxWidth: TW.desc - 8 });

    color(C.muted);   font('normal', 9);
    txt(String(item.quantity ?? '—'),           TX.qty  + 4, textY);
    txt((item.unitPrice ?? 0).toLocaleString(), TX.up   + 4, textY);

    color(C.brand);   font('bold', 9);
    txt((item.totalAmount ?? 0).toLocaleString(), TX.total, textY, { align: 'right' });

    pageItemCount++;
  });

  y += pageItemCount * ROW_H;
  fill(C.white);
  doc.rect(ML, y, CW, 34, 'F');
  stroke(C.brand);
  hline(ML, y, MR, 1.5);
  const gtY = y + 22;
  color(C.muted);
  font('normal', 9);
  txt('GRAND TOTAL', TX.up + 4, gtY);
  color(C.brand);
  font('bold', 13);
  txt(`KES ${(data.total ?? 0).toLocaleString()}`, TX.total, gtY, { align: 'right' });
  y += 34;
  if (data.notes) {
    const PAD_V = 10;
    const PAD_H = 12;
    y += 12;

    font('normal', 9);
    const wrappedLines = doc.splitTextToSize(data.notes, CW - PAD_H * 2);
    const notesBoxH    = PAD_V * 2 + 14 + wrappedLines.length * 12;

    fill(C.bg);
    doc.roundedRect(ML, y, CW, notesBoxH, 4, 4, 'F');
    stroke(C.brand);
    doc.setLineWidth(2);
    doc.line(ML, y, ML, y + notesBoxH);
    doc.setLineWidth(0.5);

    color(C.subtle);
    font('normal', 7.5);
    txt('NOTES', ML + PAD_H, y + PAD_V + 8);

    color(C.muted);
    font('normal', 9);
    doc.text(wrappedLines, ML + PAD_H, y + PAD_V + 22);
    y += notesBoxH;
  }
  y += 24;
  fill(C.bg);
  doc.roundedRect(ML, y, CW, 42, 4, 4, 'F');
  stroke(C.brandBorder);
  doc.setLineWidth(0.6);
  doc.roundedRect(ML, y, CW, 42, 4, 4, 'S');

  color(C.brand);
  font('bold', 10);
  txt('GRAVILLE ENTERPRISES LIMITED', ML + 14, y + 16);

  color(C.muted);
  font('normal', 8.5);
  txt('Operations Management System', ML + 14, y + 30);

  color(C.subtle);
  font('normal', 8);
  const genDate = new Date().toLocaleDateString('en-KE', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  txt(`Generated: ${genDate}`, MR, y + 16, { align: 'right' });
  txt(`${data.invoiceType} Invoice · ${data.invoiceNo}`, MR, y + 30, { align: 'right' });

  y += 42;

  doc.save(`${data.invoiceNo ?? 'invoice'}.pdf`);
}