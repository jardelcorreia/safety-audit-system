import { api, APIError } from "encore.dev/api";
import { auditorDB } from "./db";
import type { CreateAuditorRequest, Auditor } from "./types";

// Creates a new auditor.
export const create = api<CreateAuditorRequest, Auditor>(
  { expose: true, method: "POST", path: "/auditors" },
  async (req) => {
    try {
      const result = await auditorDB.queryRow<Auditor>`
        INSERT INTO auditors (name) 
        VALUES (${req.name.trim()})
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
