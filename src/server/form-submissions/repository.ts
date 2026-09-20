import 'server-only';

import { randomUUID } from 'node:crypto';
import { getDb } from '@/server/db';
import type {
  CreateFormSubmissionInput,
  FormSubmissionRecord,
} from '@/server/form-submissions/types';

export async function createFormSubmission(
  input: CreateFormSubmissionInput,
): Promise<FormSubmissionRecord> {
  const db = await getDb();
  const now = new Date().toISOString();
  const submissionId = randomUUID();

  await db.execute({
    sql: `
      INSERT INTO form_submissions (id, form_slug, person_id, selected_places, created_at)
      VALUES (:id, :slug, :personId, :selectedPlaces, :createdAt)
    `,
    args: {
      id: submissionId,
      slug: input.slug,
      personId: input.userId,
      selectedPlaces: JSON.stringify(input.places),
      createdAt: now,
    },
  });

  return {
    id: submissionId,
    slug: input.slug,
    userId: input.userId,
    places: input.places,
    createdAt: now,
  };
}
