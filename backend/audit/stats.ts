import { api } from "encore.dev/api";
import { auditDB } from "./db";
import type { AuditStats } from "./types";

// Retrieves audit statistics and metrics.
export const getStats = api<void, AuditStats>(
  { expose: true, method: "GET", path: "/audits/stats" },
  async () => {
    // Total audits
    const totalResult = await auditDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM audits
    `;
    const totalAudits = totalResult?.count || 0;

    // Resolved audits
    const resolvedResult = await auditDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM audits WHERE status = 'Resolvido'
    `;
    const resolvedAudits = resolvedResult?.count || 0;

    // Pending audits
    const pendingAudits = totalAudits - resolvedAudits;

    // By potential
    const potentialResults = await auditDB.queryAll<{ potential: string; count: number }>`
      SELECT potential, COUNT(*) as count 
      FROM audits 
      GROUP BY potential
    `;
    const byPotential: Record<string, number> = {};
    potentialResults.forEach(row => {
      byPotential[row.potential] = row.count;
    });

    // By area
    const areaResults = await auditDB.queryAll<{ area: string; count: number }>`
      SELECT area, COUNT(*) as count 
      FROM audits 
      GROUP BY area 
      ORDER BY count DESC
    `;
    const byArea: Record<string, number> = {};
    areaResults.forEach(row => {
      byArea[row.area] = row.count;
    });

    // By risk type
    const riskTypeResults = await auditDB.queryAll<{ risk_type: string; count: number }>`
      SELECT risk_type, COUNT(*) as count 
      FROM audits 
      GROUP BY risk_type 
      ORDER BY count DESC
    `;
    const byRiskType: Record<string, number> = {};
    riskTypeResults.forEach(row => {
      byRiskType[row.risk_type] = row.count;
    });

    // By status
    const statusResults = await auditDB.queryAll<{ status: string; count: number }>`
      SELECT status, COUNT(*) as count 
      FROM audits 
      GROUP BY status
    `;
    const byStatus: Record<string, number> = {};
    statusResults.forEach(row => {
      byStatus[row.status] = row.count;
    });

    return {
      totalAudits,
      resolvedAudits,
      pendingAudits,
      byPotential,
      byArea,
      byRiskType,
      byStatus
    };
  }
);
