import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface ReportData {
  title: string;
  subtitle?: string;
  date?: string;
  kpis?: { label: string; value: string | number }[];
  tables?: {
    title: string;
    headers: string[];
    rows: (string | number)[][];
  }[];
}

export function exportToPDF(data: ReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text(data.title, pageWidth / 2, 20, { align: "center" });
  
  if (data.subtitle) {
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(data.subtitle, pageWidth / 2, 28, { align: "center" });
  }
  
  // Date
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Gerado em: ${data.date || new Date().toLocaleDateString("pt-BR")}`,
    pageWidth / 2,
    36,
    { align: "center" }
  );

  let yPosition = 50;

  // KPIs
  if (data.kpis && data.kpis.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text("Indicadores Principais", 14, yPosition);
    yPosition += 8;

    const kpiData = data.kpis.map((kpi) => [kpi.label, String(kpi.value)]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [["Indicador", "Valor"]],
      body: kpiData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Tables
  if (data.tables) {
    for (const table of data.tables) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text(table.title, 14, yPosition);
      yPosition += 8;

      autoTable(doc, {
        startY: yPosition,
        head: [table.headers],
        body: table.rows,
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 14, right: 14 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${pageCount} - Doctor Auto Prime`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  const filename = `${data.title.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}

export function exportToExcel(data: ReportData) {
  const workbook = XLSX.utils.book_new();

  // KPIs sheet
  if (data.kpis && data.kpis.length > 0) {
    const kpiData = [
      ["Indicador", "Valor"],
      ...data.kpis.map((kpi) => [kpi.label, kpi.value]),
    ];
    const kpiSheet = XLSX.utils.aoa_to_sheet(kpiData);
    XLSX.utils.book_append_sheet(workbook, kpiSheet, "Indicadores");
  }

  // Tables sheets
  if (data.tables) {
    for (const table of data.tables) {
      const tableData = [table.headers, ...table.rows];
      const sheet = XLSX.utils.aoa_to_sheet(tableData);
      
      // Truncate sheet name to 31 chars (Excel limit)
      const sheetName = table.title.slice(0, 31);
      XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    }
  }

  const filename = `${data.title.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
