import "server-only";

import { randomUUID } from "node:crypto";
import { db } from "@/server/db";
import type {
  CreateFormSubmissionInput,
  FormSubmissionRecord,
} from "@/server/form-submissions/types";

// Функция для создания новой записи формы
export function createFormSubmission(
  input: CreateFormSubmissionInput,
): FormSubmissionRecord {
  const now = new Date().toISOString();
  const submissionId = randomUUID();

  db.prepare(`
    INSERT INTO form_submissions (id, form_slug, person_id, selected_places, created_at)
    VALUES (@id, @slug, @personId, @selectedPlaces, @createdAt)
  `).run({
    id: submissionId,
    slug: input.slug,
    personId: input.userId,
    selectedPlaces: JSON.stringify(input.places),
    createdAt: now,
  });

  return {
    id: submissionId,
    slug: input.slug,
    userId: input.userId,
    places: input.places,
    createdAt: now,
  };
}
