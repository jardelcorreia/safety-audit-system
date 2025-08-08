import { api, APIError } from "encore.dev/api";
import { auditorDB } from "./db";
import type { UpdateAuditorRequest, Auditor } from "./types";

// Updates an existing auditor.
export const update = api<UpdateAuditorRequest, Auditor>(
  { expose: true, method: "PUT", path: "/auditors/:id" },
  async (req) => {
    // Check if auditor exists
    const existing = await auditorDB.queryRow`SELECT id FROM auditors WHERE id = ${req.id}`;
    if (!existing) {
      throw APIError.notFound("auditor not found");
    }

    try {
      const result = await auditorDB.queryRow<Auditor>`
        UPDATE auditors 
        SET name = ${req.name.trim()}
        WHERE id = ${req.id}
        RETURNING 
          id,
          name,
          created_at as "createdAt"
      `;

      return result!;
    } catch (error: any) {
      if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
        throw APIError.alreadyExists("auditor with this name already exists");
      }
      throw error;
    }
  }
);
