import { api } from "encore.dev/api";
import { auditDB } from "./db";
import type { AuditTrends } from "./types";

// Retrieves audit trends and performance metrics.
export const getTrends = api<void, AuditTrends>(
  { expose: true, method: "GET", path: "/audits/trends" },
  async () => {
    // Monthly trends
    const monthlyResults = await auditDB.queryAll<{
      month: string;
      total: number;
      resolved: number;
    }>`
      SELECT 
        TO_CHAR(audit_date, 'YYYY-MM') as month,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'Resolvido' THEN 1 END) as resolved
      FROM audits 
      WHERE audit_date >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY TO_CHAR(audit_date, 'YYYY-MM')
      ORDER BY month
    `;

    const monthlyTrends = monthlyResults.map(row => ({
      month: row.month,
      total: row.total,
      resolved: row.resolved,
      pending: row.total - row.resolved
    }));

    // Area performance
    const areaResults = await auditDB.queryAll<{
      area: string;
      total: number;
      resolved: number;
      avg_resolution_days: string;
    }>`
      SELECT 
        area,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'Resolvido' THEN 1 END) as resolved,
        COALESCE(AVG(
          CASE WHEN status = 'Resolvido' 
          THEN EXTRACT(DAY FROM (deadline::timestamp - audit_date::timestamp))
          END
        ), 0)::text as avg_resolution_days
      FROM audits 
      GROUP BY area
      ORDER BY total DESC
    `;

    const areaPerformance = areaResults.map(row => ({
      area: row.area,
      total: row.total,
      resolutionRate: row.total > 0 ? (row.resolved / row.total) * 100 : 0,
      avgResolutionDays: Math.round(parseFloat(row.avg_resolution_days) || 0)
    }));

    // Risk distribution
    const riskResults = await auditDB.queryAll<{
      risk_type: string;
      count: number;
    }>`
      SELECT risk_type, COUNT(*) as count 
      FROM audits 
      GROUP BY risk_type 
      ORDER BY count DESC
    `;

    const totalRisks = riskResults.reduce((sum, row) => sum + row.count, 0);
    const riskDistribution = riskResults.map(row => ({
      riskType: row.risk_type,
      count: row.count,
      percentage: totalRisks > 0 ? (row.count / totalRisks) * 100 : 0
    }));

    return {
      monthlyTrends,
      areaPerformance,
      riskDistribution
    };
  }
);
