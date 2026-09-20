import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import { createClient, type Client, type Row } from '@libsql/client';

const DEFAULT_DB_PATH = path.join(process.cwd(), 'data', 'app.db');

const SCHEMA_SQL = `
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
`;

type DbConfig = {
  url: string;
  authToken?: string;
};

function isRemoteDatabaseUrl(url: string) {
  return url.startsWith('libsql:') || url.startsWith('https:') || url.startsWith('http:');
}

function resolveFileUrl(configuredPath?: string) {
  const dbPath = !configuredPath
    ? DEFAULT_DB_PATH
    : path.isAbsolute(configuredPath)
      ? configuredPath
      : path.join(process.cwd(), configuredPath);

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  return `file:${dbPath.replace(/\\/g, '/')}`;
}

function resolveDbConfig(): DbConfig {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim() || undefined;
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (tursoUrl) {
    return { url: tursoUrl, authToken };
  }

  if (databaseUrl && isRemoteDatabaseUrl(databaseUrl)) {
    return { url: databaseUrl, authToken };
  }

  if (process.env.VERCEL) {
    throw new Error(
      'На Vercel нужна удалённая база. Задайте TURSO_DATABASE_URL и TURSO_AUTH_TOKEN.',
    );
  }

  return { url: resolveFileUrl(databaseUrl) };
}

function createDatabaseClient() {
  return createClient(resolveDbConfig());
}

function hasColumn(rows: Row[], columnName: string) {
  return rows.some((row) => String(row.name ?? row[1]) === columnName);
}

async function initializeSchema(client: Client) {
  if (client.protocol === 'file') {
    await client.execute('PRAGMA foreign_keys = ON');
  }

  await client.executeMultiple(SCHEMA_SQL);

  const formPlaces = await client.execute('PRAGMA table_info(form_places)');
  if (!hasColumn(formPlaces.rows, 'link')) {
    await client.execute('ALTER TABLE form_places ADD COLUMN link TEXT');
  }

  const formSubmissions = await client.execute('PRAGMA table_info(form_submissions)');
  if (!hasColumn(formSubmissions.rows, 'person_id')) {
    await client.execute('ALTER TABLE form_submissions ADD COLUMN person_id TEXT');
  }
}

declare global {
  var __libsqlClient__: Client | undefined;
  var __libsqlReady__: Promise<Client> | undefined;
}

export function getDb(): Promise<Client> {
  if (!globalThis.__libsqlReady__) {
    globalThis.__libsqlReady__ = (async () => {
      const client = globalThis.__libsqlClient__ ?? createDatabaseClient();

      if (process.env.NODE_ENV !== 'production') {
        globalThis.__libsqlClient__ = client;
      }

      await initializeSchema(client);

      return client;
    })();
  }

  return globalThis.__libsqlReady__;
}
