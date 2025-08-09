import { api } from "encore.dev/api";
import { areaDB } from "./db";
import type { Area } from "./types";

interface ListResponse {
  areas: Area[];
}

// Lists all predefined areas.
export const list = api<void, ListResponse>(
  { expose: true, method: "GET", path: "/areas" },
  async () => {
    const result = await areaDB.query<Area>`
      SELECT id, name FROM areas ORDER BY name ASC
    `;
    return { areas: result.rows ?? [] };
  }
);
