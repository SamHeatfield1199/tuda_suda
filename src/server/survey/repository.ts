import "server-only";

import { randomUUID } from "node:crypto";
import { db } from "@/server/db";
import type { CreateFormInput, FormPlace, FormPerson, FormRecord } from "@/server/survey/types";

function createSlug() {
  return randomUUID().replace(/-/g, "").slice(0, 8);
}

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

export function getSurveyResult(slug: string) {
  const surveyRecord = db.prepare(`
    SELECT *
    FROM forms
    WHERE slug = @slug
  `).get({slug});

  if (!surveyRecord) {
    throw new Error(`Survey with slug ${slug} not found`);
  }

  const people = db.prepare(`
    SELECT id, name
    FROM form_people
    WHERE form_id = @formId
  `).all({formId: surveyRecord.id});

  const places = db.prepare(`
    SELECT id, name, link
    FROM form_places
    WHERE form_id = @formId
  `).all({formId: surveyRecord.id});

  type Submission = { person_id: string; selected_places: string };

  /*const submissions: Submission[] = db.prepare(`
    SELECT form_submissions.person_id, form_submissions.selected_places
    FROM form_submissions
    WHERE form_slug = @slug
  `).all({slug});*/

  return {
    id: surveyRecord.id,
    slug: surveyRecord.slug,
    createdAt: surveyRecord.created_at,
    people,
    places: places.map((place: FormPlace) => ({
      ...place,
      /*chosenBy: submissions
          .filter((submission: Submission) => submission.selected_places === place.id)
          .map((submission: Submission) => submission.person_id),*/
      people: [],
    })),
  };
}
