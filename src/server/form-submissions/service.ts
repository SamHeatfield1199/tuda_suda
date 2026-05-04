import "server-only";

import { HttpError } from "@/server/http-error";
import { createFormSubmission } from "@/server/form-submissions/repository";
import type {
  CreateFormSubmissionInput,
  SubmittedPlaceInput,
} from "@/server/form-submissions/types";

function normalizePersonId(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePlaces(items: unknown): SubmittedPlaceInput[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item): SubmittedPlaceInput | null => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const id   = typeof item.id === "string" ? item.id.trim() : "";
      const name = typeof item.name === "string" ? item.name.trim() : "";

      if (!id || !name) {
        return null;
      }

      return { id, name };
    })
    .filter((item): item is SubmittedPlaceInput => item !== null);
}

export function parseCreateFormSubmissionInput(
  slug: string,
  body: unknown,
): CreateFormSubmissionInput {
  const normalizedSlug = slug.trim();
  const userId = normalizePersonId((body as Record<string, unknown> | null)?.userId);
  const places = normalizePlaces((body as Record<string, unknown> | null)?.places);

  if (!normalizedSlug) {
    throw new HttpError("Form slug is required", 400);
  }

  if (!userId) {
    throw new HttpError("User id is required", 400);
  }

  if (places.length === 0) {
    throw new HttpError("At least one selected place is required", 400);
  }

  return {
    slug: normalizedSlug,
    userId,
    places,
  };
}

export function createFormSubmissionRecord(slug: string, body: unknown) {
  const input = parseCreateFormSubmissionInput(slug, body);

  return createFormSubmission(input);
}
