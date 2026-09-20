import 'server-only';

import { randomUUID } from 'node:crypto';
import { getDb } from '@/server/db';
import type { CreateFormInput, FormPlace, FormPerson, FormRecord } from '@/server/survey/types';

// Тип для строки из таблицы forms
type SurveyRow = {
  id: string;
  slug: string;
  created_at: string;
};

// Тип для строки из таблицы form_submissions
type SubmissionRow = {
  person_id: string | null;
  selected_places: string;
};

// Функция для парсинга строки с выбранными местами
function parseSelectedPlaceIds(selectedPlaces: string): string[] {
  try {
    const parsed = JSON.parse(selectedPlaces) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(Boolean);
  } catch {
    return [];
  }
}

// Функция для генерации уникального slug для формы
function createSlug() {
  return randomUUID().replace(/-/g, '').slice(0, 8);
}

// Функция для создания записи о форме
export async function createSurveyRecord(input: CreateFormInput): Promise<FormRecord> {
  const db = await getDb();
  const now = new Date().toISOString();
  const formId = randomUUID();
  const slug = createSlug();

  const people: FormPerson[] = input.people.map((name) => ({
    id: randomUUID(),
    name,
  }));

  const places: FormPlace[] = input.places.map((place) => ({
    id: randomUUID(),
    name: place.name,
    link: place.link,
  }));

  await db.batch(
    [
      {
        sql: `
          INSERT INTO forms (id, slug, created_at)
          VALUES (:id, :slug, :createdAt)
        `,
        args: {
          id: formId,
          slug,
          createdAt: now,
        },
      },
      ...people.map((person) => ({
        sql: `
          INSERT INTO form_people (id, form_id, name, created_at)
          VALUES (:id, :formId, :name, :createdAt)
        `,
        args: {
          id: person.id,
          formId,
          name: person.name,
          createdAt: now,
        },
      })),
      ...places.map((place) => ({
        sql: `
          INSERT INTO form_places (id, form_id, name, link, created_at)
          VALUES (:id, :formId, :name, :link, :createdAt)
        `,
        args: {
          id: place.id,
          formId,
          name: place.name,
          link: place.link,
          createdAt: now,
        },
      })),
    ],
    'write',
  );

  return {
    id: formId,
    slug,
    people,
    places,
    createdAt: now,
  };
}

export async function getSurveyResult(slug: string) {
  const db = await getDb();
  const surveyResult = await db.execute({
    sql: `
      SELECT *
      FROM forms
      WHERE slug = :slug
    `,
    args: { slug },
  });

  const surveyRecord = surveyResult.rows[0] as unknown as SurveyRow | undefined;

  if (!surveyRecord) {
    return null;
  }

  const [peopleResult, placesResult, submissionsResult] = await Promise.all([
    db.execute({
      sql: `
        SELECT id, name
        FROM form_people
        WHERE form_id = :formId
      `,
      args: { formId: surveyRecord.id },
    }),
    db.execute({
      sql: `
        SELECT id, name, link
        FROM form_places
        WHERE form_id = :formId
      `,
      args: { formId: surveyRecord.id },
    }),
    db.execute({
      sql: `
        SELECT person_id, selected_places
        FROM form_submissions
        WHERE form_slug = :slug
      `,
      args: { slug },
    }),
  ]);

  const people = peopleResult.rows as unknown as FormPerson[];
  const places = placesResult.rows as unknown as FormPlace[];
  const submissions = submissionsResult.rows as unknown as SubmissionRow[];
  const peopleByPlaceId = new Map<string, string[]>();

  for (const submission of submissions) {
    if (!submission.person_id) {
      continue;
    }

    for (const placeId of parseSelectedPlaceIds(submission.selected_places)) {
      const placePeople = peopleByPlaceId.get(placeId) ?? [];

      placePeople.push(submission.person_id);
      peopleByPlaceId.set(placeId, placePeople);
    }
  }

  return {
    id: surveyRecord.id,
    slug: surveyRecord.slug,
    createdAt: surveyRecord.created_at,
    people,
    places: places.map((place) => ({
      ...place,
      people: peopleByPlaceId.get(place.id) ?? [],
    })),
  };
}

export async function deleteSurveyRecord(slug: string): Promise<boolean> {
  const db = await getDb();
  const result = await db.execute({
    sql: `
      DELETE FROM forms
      WHERE slug = :slug
    `,
    args: { slug },
  });

  return result.rowsAffected > 0;
}
