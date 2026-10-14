import type { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile();

const envOrThrow = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

export type APIConfig = {
  fileserverHits: number;
  port: number;
  platform: string;
  jwtSecret: string;
  db: DBConfig;
};

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

export const config: APIConfig = {
  fileserverHits: 0,
  port: Number(envOrThrow("PORT")),
  platform: envOrThrow("PLATFORM"),
  jwtSecret: envOrThrow("JWT_SECRET"),
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig,
  },
};
