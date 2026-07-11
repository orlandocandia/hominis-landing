// Report Service — generates sales, performance, and marketing reports.
// Uses raw SQL via libsql (project pattern) + ExcelJS for Excel export.
import { getTursoClient } from '@/lib/turso-config';
import ExcelJS from 'exceljs';

export interface SalesReport {
  totalLeads: number;
  conversions: number;
  conversionRate: number;
  byStatus: Record<string, number>;
  bySegment: Record<string, number>;
  byVendor: Array<{ name: string; leads: number; conversions: number; conversionRate: number }>;
  bySource: Array<{ name: string; category: string; leads: number; conversions: number }>;
  contacts: any[];
}

export class ReportService {
  /**
   * Generate a sales report for a date range.
   */
  static async generateSalesReport(startDate: Date, endDate: Date): Promise<SalesReport> {
    const libsql = getTursoClient();
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Fetch contacts in range with owner + source
    const contactsRes = await libsql.execute({
      sql: `SELECT c.id, c.name, c.primaryEmail, c.primaryPhone, c.address, c.city,
        c.segment, c.coverage, c.status, c.leadScore, c.leadPriority, c.createdAt,
        u.nombre as ownerNombre, u.apellido as ownerApellido,
        ls.name as sourceName, ls.category as sourceCategory
        FROM Contact c
        LEFT JOIN "User" u ON c.ownerId = u.id
        LEFT JOIN "LeadSource" ls ON c.sourceId = ls.id
        WHERE c.createdAt >= ? AND c.createdAt <= ?
        ORDER BY c.createdAt DESC`,
      args: [startISO, endISO],
    });
    const contacts = contactsRes.rows as any[];

    const totalLeads = contacts.length;
    const conversions = contacts.filter((c) => c.status === 'ATENDIDO').length;
    const conversionRate = totalLeads > 0 ? Number(((conversions / totalLeads) * 100).toFixed(2)) : 0;

    // Group by status
    const byStatus: Record<string, number> = {};
    contacts.forEach((c) => { byStatus[c.status] = (byStatus[c.status] || 0) + 1; });

    // Group by segment
    const bySegment: Record<string, number> = {};
    contacts.forEach((c) => { const s = c.segment || 'SIN_SEGMENTO'; bySegment[s] = (bySegment[s] || 0) + 1; });

    // Group by vendor
    const vendorMap: Record<string, { name: string; leads: number; conversions: number }> = {};
    contacts.forEach((c) => {
      const key = c.ownerNombre || 'Sin asignar';
      if (!vendorMap[key]) vendorMap[key] = { name: key, leads: 0, conversions: 0 };
      vendorMap[key].leads++;
      if (c.status === 'ATENDIDO') vendorMap[key].conversions++;
    });
    const byVendor = Object.values(vendorMap).map((v) => ({
      ...v, conversionRate: v.leads > 0 ? Number(((v.conversions / v.leads) * 100).toFixed(2)) : 0,
    })).sort((a, b) => b.leads - a.leads);

    // Group by source
    const sourceMap: Record<string, { name: string; category: string; leads: number; conversions: number }> = {};
    contacts.forEach((c) => {
      const key = c.sourceName || 'Sin fuente';
      if (!sourceMap[key]) sourceMap[key] = { name: key, category: c.sourceCategory || 'UNKNOWN', leads: 0, conversions: 0 };
      sourceMap[key].leads++;
      if (c.status === 'ATENDIDO') sourceMap[key].conversions++;
    });
    const bySource = Object.values(sourceMap).sort((a, b) => b.leads - a.leads);

    return { totalLeads, conversions, conversionRate, byStatus, bySegment, byVendor, bySource, contacts };
  }

  /**
   * Generate a performance report (per-vendor breakdown with pipeline stages).
   */
  static async generatePerformanceReport(startDate: Date, endDate: Date): Promise<any> {
    const libsql = getTursoClient();
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    const res = await libsql.execute({
      sql: `SELECT u.id, u.nombre, u.apellido, u.email, u.rol,
        COUNT(c.id) as totalContacts,
        SUM(CASE WHEN c.status = 'ATENDIDO' THEN 1 ELSE 0 END) as conversions,
        SUM(CASE WHEN c.status = 'NUEVO' THEN 1 ELSE 0 END) as nuevos,
        SUM(CASE WHEN c.status = 'EN_CONTACTO' THEN 1 ELSE 0 END) as enContacto,
        SUM(CASE WHEN c.status = 'REUNION' THEN 1 ELSE 0 END) as reuniones,
        SUM(CASE WHEN c.status = 'PRESUPUESTO' THEN 1 ELSE 0 END) as presupuestos,
        SUM(CASE WHEN c.status = 'RECHAZADO' THEN 1 ELSE 0 END) as rechazados,
        AVG(c.leadScore) as avgScore
        FROM "User" u
        LEFT JOIN Contact c ON c.ownerId = u.id AND c.createdAt >= ? AND c.createdAt <= ?
        WHERE u.rol IN ('VENDEDOR', 'PRODUCTOR') AND u.activo = 1
        GROUP BY u.id, u.nombre, u.apellido, u.email, u.rol
        ORDER BY totalContacts DESC`,
      args: [startISO, endISO],
    });

    return res.rows.map((r: any) => ({
      ...r,
      conversionRate: Number(r.totalContacts) > 0 ? Number(((Number(r.conversions) / Number(r.totalContacts)) * 100).toFixed(2)) : 0,
      avgScore: r.avgScore ? Number(r.avgScore).toFixed(1) : 0,
    }));
  }

  /**
   * Export contacts to Excel.
   */
  static async exportExcel(contacts: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Contactos');

    worksheet.columns = [
      { header: 'Nombre', key: 'name', width: 25 },
      { header: 'Email', key: 'primaryEmail', width: 30 },
      { header: 'Teléfono', key: 'primaryPhone', width: 20 },
      { header: 'Dirección', key: 'address', width: 30 },
      { header: 'Ciudad', key: 'city', width: 20 },
      { header: 'Segmento', key: 'segment', width: 18 },
      { header: 'Cobertura', key: 'coverage', width: 12 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Score', key: 'leadScore', width: 10 },
      { header: 'Prioridad', key: 'leadPriority', width: 12 },
      { header: 'Vendedor', key: 'ownerName', width: 25 },
      { header: 'Fuente', key: 'sourceName', width: 18 },
      { header: 'Fecha', key: 'createdAt', width: 20 },
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    contacts.forEach((c) => {
      worksheet.addRow({
        name: c.name,
        primaryEmail: c.primaryEmail || '',
        primaryPhone: c.primaryPhone || '',
        address: c.address || '',
        city: c.city || '',
        segment: c.segment || '',
        coverage: c.coverage || '',
        status: c.status,
        leadScore: c.leadScore || 0,
        leadPriority: c.leadPriority || '',
        ownerName: `${c.ownerNombre || ''} ${c.ownerApellido || ''}`.trim(),
        sourceName: c.sourceName || '',
        createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString('es-AR') : '',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
