import { api } from "encore.dev/api";
import { auditorDB } from "./db";
import type { ListAuditorsResponse, Auditor } from "./types";

// Retrieves all auditors ordered by name.
export const list = api<void, ListAuditorsResponse>(
  { expose: true, method: "GET", path: "/auditors" },
  async () => {
    const auditors = await auditorDB.queryAll<Auditor>`
      SELECT 
        id,
        name,
        created_at as "createdAt"
      FROM auditors 
      ORDER BY name ASC
    `;

    return { auditors };
  }
);
