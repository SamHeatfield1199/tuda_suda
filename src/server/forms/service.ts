import "server-only";

import { HttpError } from "@/server/http-error";
import { createForm } from "@/server/forms/repository";
import type { CreateFormInput, FormPlaceInput } from "@/server/forms/types";

function normalizeList(items: unknown) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePlaces(items: unknown): FormPlaceInput[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item): FormPlaceInput | null => {
      if (typeof item === "string") {
        const name = item.trim();

        return name ? { name, link: null } : null;
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      const name = typeof item.name === "string" ? item.name.trim() : "";
      const rawLink = typeof item.link === "string" ? item.link.trim() : "";

      if (!name) {
        return null;
      }

      return {
        name,
        link: rawLink || null,
      };
    })
    .filter((item): item is FormPlaceInput => item !== null);
}

export function parseCreateFormInput(body: unknown): CreateFormInput {
  const places = normalizePlaces((body as Record<string, unknown> | null)?.places);
  const people = normalizeList((body as Record<string, unknown> | null)?.people);

  if (places.length === 0) {
    throw new HttpError("At least one place is required", 400);
  }

  if (people.length === 0) {
    throw new HttpError("At least one person is required", 400);
  }

  return { places, people };
}

export function createFormRecord(body: unknown) {
  const input = parseCreateFormInput(body);

  return createForm(input);
}
