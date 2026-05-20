import "server-only";

import { randomUUID } from "node:crypto";
import { db } from "@/server/db";
import type { CreateFormInput, FormPlace, FormPerson, FormRecord } from "@/server/survey/types";

// Тип для строки из таблицы forms
type SurveyRow = {
  id:         string;
  slug:       string;
  created_at: string;
};

type SubmissionRow = {
  person_id:       string | null;
  selected_places: string;
};

function parseSelectedPlaceIds(selectedPlaces: string): string[] {
  try {
    const parsed = JSON.parse(selectedPlaces) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((place) => {
        if (!place || typeof place !== "object") {
          return "";
        }

        const id = (place as { id?: unknown }).id;

        return typeof id === "string" ? id : "";
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

// Функция для генерации уникального slug для формы
function createSlug() {
  return randomUUID().replace(/-/g, "").slice(0, 8);
}

// Функция для создания новой формы опроса
export function createSurvey(input: CreateFormInput): FormRecord {
  const now    = new Date().toISOString();
  const formId = randomUUID();
  const slug   = createSlug();

  const people: FormPerson[] = input.people.map((name) => ({
    id: randomUUID(),
    name,
  }));

  const places: FormPlace[] = input.places.map((place) => ({
    id: randomUUID(),
    name: place.name,
    link: place.link,
  }));

  const insertForm = db.prepare(`
    INSERT INTO forms (id, slug, created_at)
    VALUES (@id, @slug, @createdAt)
  `);

  const insertPerson = db.prepare(`
    INSERT INTO form_people (id, form_id, name, created_at)
    VALUES (@id, @formId, @name, @createdAt)
  `);

  const insertPlace = db.prepare(`
    INSERT INTO form_places (id, form_id, name, link, created_at)
    VALUES (@id, @formId, @name, @link, @createdAt)
  `);

  const transaction = db.transaction(() => {
    insertForm.run({
      id: formId,
      slug,
      createdAt: now,
    });

    for (const person of people) {
      insertPerson.run({
        id: person.id,
        formId,
        name: person.name,
        createdAt: now,
      });
    }

    for (const place of places) {
      insertPlace.run({
        id: place.id,
        formId,
        name: place.name,
        link: place.link,
        createdAt: now,
      });
    }
  });

  transaction();

  return {
    id: formId,
    slug,
    people,
    places,
    createdAt: now,
  };
}

// Функция для получения данных формы по slug
export function getSurveyResult(slug: string) {
  const surveyRecord = db.prepare(`
    SELECT *
    FROM forms
    WHERE slug = @slug
  `).get({slug}) as SurveyRow | undefined;

  if (!surveyRecord) {
    throw new Error(`Survey with slug ${slug} not found`);
  }

  const people = db.prepare(`
    SELECT id, name
    FROM form_people
    WHERE form_id = @formId
  `).all({formId: surveyRecord.id}) as FormPerson[];

  const places = db.prepare(`
    SELECT id, name, link
    FROM form_places
    WHERE form_id = @formId
  `).all({formId: surveyRecord.id}) as FormPlace[];

  const submissions = db.prepare(`
    SELECT person_id, selected_places
    FROM form_submissions
    WHERE form_slug = @slug
  `).all({slug}) as SubmissionRow[];

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
