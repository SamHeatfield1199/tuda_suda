import "server-only";

import { randomUUID } from "node:crypto";
import { db } from "@/server/db";
import type {
  CreateFormSubmissionInput,
  FormSubmissionRecord,
} from "@/server/form-submissions/types";

export function createFormSubmission(
  input: CreateFormSubmissionInput,
): FormSubmissionRecord {
  const now = new Date().toISOString();
  const submissionId = randomUUID();

  db.prepare(`
    INSERT INTO form_submissions (id, form_slug, selected_places, created_at)
    VALUES (@id, @slug, @selectedPlaces, @createdAt)
  `).run({
    id: submissionId,
    slug: input.slug,
    selectedPlaces: JSON.stringify(input.places),
    createdAt: now,
  });

  return {
    id: submissionId,
    slug: input.slug,
    places: input.places,
    createdAt: now,
  };
}
