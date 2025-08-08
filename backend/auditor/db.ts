import { SQLDatabase } from "encore.dev/storage/sqldb";

export const auditorDB = new SQLDatabase("auditor", {
  migrations: "./migrations",
});
