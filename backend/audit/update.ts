import { api, APIError } from "encore.dev/api";
import { auditDB } from "./db";
import type { UpdateAuditRequest, Audit } from "./types";

// Updates an existing audit record.
export const update = api<UpdateAuditRequest, Audit>(
  { expose: true, method: "PUT", path: "/audits/:id" },
  async (req) => {
    const { id, ...updates } = req;

    // Check if audit exists
    const existing = await auditDB.queryRow`SELECT id FROM audits WHERE id = ${id}`;
    if (!existing) {
      throw APIError.notFound("audit not found");
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (updates.area !== undefined) {
      updateFields.push(`area = $${paramIndex++}`);
      updateValues.push(updates.area);
    }

    if (updates.auditor !== undefined) {
      updateFields.push(`auditor = $${paramIndex++}`);
      updateValues.push(updates.auditor);
    }

    if (updates.auditDate !== undefined) {
      updateFields.push(`audit_date = $${paramIndex++}`);
      updateValues.push(updates.auditDate);
    }

    if (updates.riskType !== undefined) {
      updateFields.push(`risk_type = $${paramIndex++}`);
      updateValues.push(updates.riskType);
    }

    if (updates.potential !== undefined) {
      updateFields.push(`potential = $${paramIndex++}`);
      updateValues.push(updates.potential);
    }

    if (updates.description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateValues.push(updates.description);
    }

    if (updates.responsible !== undefined) {
      updateFields.push(`responsible = $${paramIndex++}`);
      updateValues.push(updates.responsible);
    }

    if (updates.deadline !== undefined) {
      updateFields.push(`deadline = $${paramIndex++}`);
      updateValues.push(updates.deadline);
    }

    if (updates.status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push(updates.status);
    }

    if (updates.actionDescription !== undefined) {
      updateFields.push(`action_description = $${paramIndex++}`);
      updateValues.push(updates.actionDescription);
    }

    if (updates.photos !== undefined) {
      updateFields.push(`photos = $${paramIndex++}`);
      updateValues.push(updates.photos);
    }

    if (updateFields.length === 0) {
      throw APIError.invalidArgument("no fields to update");
    }

    const updateQuery = `
      UPDATE audits 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex++}
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

    const result = await auditDB.rawQueryRow<Audit>(updateQuery, ...updateValues, id);
    return result!;
  }
);
