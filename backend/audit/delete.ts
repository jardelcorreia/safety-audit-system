import { api, APIError } from "encore.dev/api";
import { auditDB } from "./db";

interface DeleteAuditParams {
  id: number;
}

// Deletes an audit record.
export const deleteAudit = api<DeleteAuditParams, void>(
  { expose: true, method: "DELETE", path: "/audits/:id" },
  async ({ id }) => {
    const result = await auditDB.queryRow`DELETE FROM audits WHERE id = ${id} RETURNING id`;
    
    if (!result) {
      throw APIError.notFound("audit not found");
    }
  }
);
