import "server-only";

import { HttpError } from "@/server/http-error";
import {createSurveyRecord, deleteSurveyRecord, getSurveyResult} from "@/server/survey/repository";
import type { CreateFormInput, FormPlaceInput } from "@/server/survey/types";

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

export function parseCreateSurveyInput(body: unknown): CreateFormInput {
  const places = normalizePlaces((body as Record<string, unknown> | null)?.places);
  const people = normalizeList((body as Record<string, unknown> | null)?.people);

  if (places.length === 0) {
    throw new HttpError("Необходимо добавить хотя бы одно место.", 400);
  }

  if (people.length === 0) {
    throw new HttpError("Необходимо добавить хотя бы одного участника.", 400);
  }

  return { places, people };
}

export function createSurvey(body: unknown) {
  const input = parseCreateSurveyInput(body);

  return createSurveyRecord(input);
}

function validateSlug(slug: string) {
    return /^[a-zA-Z0-9]{8}$/.test(slug);
}

export function getSurvey(slug: string) {
    if (!validateSlug(slug)) {
        throw new HttpError("Неверные данные.", 400);
    }

    return getSurveyResult(slug);
}

export function deleteSurvey(slug: string): boolean {
    if (!validateSlug(slug)) {
        throw new HttpError("Неверные данные.", 400);
    }

    return deleteSurveyRecord(slug);
}