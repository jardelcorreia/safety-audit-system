import { api } from "encore.dev/api";
import { auditDB } from "./db";
import type { Audit } from "./types";

interface ImportAuditData {
  timestamp: string;
  area: string;
  auditor: string;
  date: string;
  riskType: string;
  potential: string;
  description: string;
  responsible: string;
  deadline: string;
  status: string;
  actionDescription: string;
  photos?: string;
}

interface ImportAuditsRequest {
  audits: ImportAuditData[];
}

interface ImportAuditsResponse {
  imported: number;
  errors: string[];
}

// Imports multiple audit records from external data.
export const importAudits = api<ImportAuditsRequest, ImportAuditsResponse>(
  { expose: true, method: "POST", path: "/audits/import" },
  async (req) => {
    let imported = 0;
    const errors: string[] = [];

    for (let i = 0; i < req.audits.length; i++) {
      const audit = req.audits[i];
      
      try {
        // Parse dates
        const timestamp = new Date(audit.timestamp);
        const auditDate = new Date(audit.date);
        const deadline = new Date(audit.deadline);

        // Validate required fields
        if (!audit.area || !audit.auditor || !audit.riskType || !audit.description || !audit.actionDescription) {
          errors.push(`Row ${i + 1}: Missing required fields`);
          continue;
        }

        // Insert audit
        await auditDB.exec`
          INSERT INTO audits (
            timestamp, area, auditor, audit_date, risk_type, potential,
            description, responsible, deadline, status, action_description, photos
          ) VALUES (
            ${timestamp}, ${audit.area}, ${audit.auditor}, ${auditDate},
            ${audit.riskType}, ${audit.potential}, ${audit.description}, 
            ${audit.responsible}, ${deadline}, ${audit.status}, ${audit.actionDescription}, ${audit.photos}
          )
        `;

        imported++;
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      imported,
      errors
    };
  }
);
