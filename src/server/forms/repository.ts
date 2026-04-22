import "server-only";

import { randomUUID } from "node:crypto";
import { db } from "@/server/db";
import type { CreateFormInput, FormPlace, FormPerson, FormRecord } from "@/server/forms/types";

function createSlug() {
  return randomUUID().replace(/-/g, "").slice(0, 8);
}

export function createForm(input: CreateFormInput): FormRecord {
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
