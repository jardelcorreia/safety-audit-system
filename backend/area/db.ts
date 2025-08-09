import { SQLDatabase } from "encore.dev/storage/sqldb";

export const areaDB = new SQLDatabase("area", {
  migrations: "./migrations",
});
