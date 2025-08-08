import { api, APIError } from "encore.dev/api";
import { auditorDB } from "./db";

interface DeleteAuditorParams {
  id: number;
}

// Deletes an auditor.
export const deleteAuditor = api<DeleteAuditorParams, void>(
  { expose: true, method: "DELETE", path: "/auditors/:id" },
  async ({ id }) => {
    const result = await auditorDB.queryRow`DELETE FROM auditors WHERE id = ${id} RETURNING id`;
    
    if (!result) {
      throw APIError.notFound("auditor not found");
    }
  }
);
