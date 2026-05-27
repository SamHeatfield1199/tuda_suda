import 'server-only';

import { HttpError } from '@/server/http-error';
import { createFormSubmission } from '@/server/form-submissions/repository';
import type {
  CreateFormSubmissionInput,
  SubmittedPlaceInput,
} from '@/server/form-submissions/types';

// Функция для нормализации идентификатора пользователя
function normalizePersonId(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

// Функция для нормализации и валидации данных
function normalizePlaces(items: unknown): SubmittedPlaceInput[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item): SubmittedPlaceInput | null => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const id = typeof item.id === 'string' ? item.id.trim() : '';
      const name = typeof item.name === 'string' ? item.name.trim() : '';

      if (!id || !name) {
        return null;
      }

      return { id, name };
    })
    .filter((item): item is SubmittedPlaceInput => item !== null);
}

// Функция для обработки и валидации данных из запроса на создание новой записи формы
export function parseCreateFormSubmissionInput(
  slug: string,
  body: unknown,
): CreateFormSubmissionInput {
  const normalizedSlug = slug.trim();
  const userId = normalizePersonId((body as Record<string, unknown> | null)?.userId);
  const places = normalizePlaces((body as Record<string, unknown> | null)?.places);

  if (!normalizedSlug) {
    throw new HttpError('Необходимо указать slug формы', 400);
  }

  if (!userId) {
    throw new HttpError('Идентификатор пользователя обязателен', 400);
  }

  if (places.length === 0) {
    throw new HttpError('Необходимо выбрать хотя бы одно место', 400);
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
