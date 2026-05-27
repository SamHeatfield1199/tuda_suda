import "server-only";

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const DEFAULT_DB_PATH = path.join(process.cwd(), "data", "app.db");

function resolveDbPath() {
  const configuredPath = process.env.DATABASE_URL?.trim();

  if (!configuredPath) {
    return DEFAULT_DB_PATH;
  }

  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.join(process.cwd(), configuredPath);
}

function createDatabase() {
  const dbPath = resolveDbPath();

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);

  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS forms (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS form_people (
      id TEXT PRIMARY KEY,
      form_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS form_places (
      id TEXT PRIMARY KEY,
      form_id TEXT NOT NULL,
      name TEXT NOT NULL,
      link TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS form_submissions (
      id TEXT PRIMARY KEY,
      form_slug TEXT NOT NULL,
      person_id TEXT,
      selected_places TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (form_slug) REFERENCES forms(slug) ON DELETE CASCADE
    );
  `);

  const formPlacesColumns = db
    .prepare("PRAGMA table_info(form_places)")
    .all() as Array<{ name: string }>;

  const hasLinkColumn = formPlacesColumns.some((column) => column.name === "link");

  if (!hasLinkColumn) {
    db.exec("ALTER TABLE form_places ADD COLUMN link TEXT");
  }

  const formSubmissionsColumns = db
    .prepare("PRAGMA table_info(form_submissions)")
    .all() as Array<{ name: string }>;

  const hasPersonIdColumn = formSubmissionsColumns.some((column) => column.name === "person_id");

  if (!hasPersonIdColumn) {
    db.exec("ALTER TABLE form_submissions ADD COLUMN person_id TEXT");
  }

  return db;
}

declare global {
  var __db__: Database.Database | undefined;
}

export const db = globalThis.__db__ ?? createDatabase();

if (process.env.NODE_ENV !== "production") {
  globalThis.__db__ = db;
}
