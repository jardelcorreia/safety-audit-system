import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { auditDB } from "./db";
import type { ListAuditsParams, ListAuditsResponse, Audit } from "./types";

interface ListAuditsQuery {
  area?: Query<string>;
  auditor?: Query<string>;
  status?: Query<string>;
  potential?: Query<string>;
  riskType?: Query<string>;
  startDate?: Query<string>;
  endDate?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

// Retrieves all audits with optional filtering and pagination.
export const list = api<ListAuditsQuery, ListAuditsResponse>(
  { expose: true, method: "GET", path: "/audits" },
  async (params) => {
    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (params.area) {
      whereConditions.push(`area = $${paramIndex++}`);
      queryParams.push(params.area);
    }

    if (params.auditor) {
      whereConditions.push(`auditor = $${paramIndex++}`);
      queryParams.push(params.auditor);
    }

    if (params.status) {
      whereConditions.push(`status = $${paramIndex++}`);
      queryParams.push(params.status);
    }

    if (params.potential) {
      whereConditions.push(`potential = $${paramIndex++}`);
      queryParams.push(params.potential);
    }

    if (params.riskType) {
      whereConditions.push(`risk_type = $${paramIndex++}`);
      queryParams.push(params.riskType);
    }

    if (params.startDate) {
      whereConditions.push(`audit_date >= $${paramIndex++}`);
      queryParams.push(params.startDate);
    }

    if (params.endDate) {
      whereConditions.push(`audit_date <= $${paramIndex++}`);
      queryParams.push(params.endDate);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    const limit = params.limit || 50;
    const offset = params.offset || 0;

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM audits ${whereClause}`;
    const countResult = await auditDB.rawQueryRow<{ count: number }>(countQuery, ...queryParams);
    const total = countResult?.count || 0;

    // Get audits
    const auditsQuery = `
      SELECT 
        id,
        timestamp,
        area,
        auditor,
        audit_date as "auditDate",
        risk_type as "riskType",
        potential,
        description,
        responsible,
        deadline,
        status,
        action_description as "actionDescription",
        photos,
        created_at as "createdAt"
      FROM audits 
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const audits = await auditDB.rawQueryAll<Audit>(auditsQuery, ...queryParams, limit, offset);

    return {
      audits,
      total
    };
  }
);
