import { api, APIError } from "encore.dev/api";
import { auditDB } from "./db";
import type { Audit } from "./types";

interface GetAuditParams {
  id: number;
}

// Retrieves a specific audit by ID.
export const get = api<GetAuditParams, Audit>(
  { expose: true, method: "GET", path: "/audits/:id" },
  async ({ id }) => {
    const audit = await auditDB.queryRow<Audit>`
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
      WHERE id = ${id}
    `;

    if (!audit) {
      throw APIError.notFound("audit not found");
    }

    return audit;
  }
);
