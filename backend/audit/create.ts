import { api } from "encore.dev/api";
import { auditDB } from "./db";
import type { CreateAuditRequest, Audit } from "./types";

// Creates a new audit record.
export const create = api<CreateAuditRequest, Audit>(
  { expose: true, method: "POST", path: "/audits" },
  async (req) => {
    const result = await auditDB.queryRow<Audit>`
      INSERT INTO audits (
        timestamp, area, auditor, audit_date, risk_type, potential,
        description, responsible, deadline, status, action_description, photos
      ) VALUES (
        ${req.timestamp}, ${req.area}, ${req.auditor}, ${req.auditDate},
        ${req.riskType}, ${req.potential}, ${req.description}, ${req.responsible},
        ${req.deadline}, ${req.status}, ${req.actionDescription}, ${req.photos}
      )
      RETURNING 
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
    `;

    return result!;
  }
);
