import 'server-only';

import { HttpError } from '@/server/http-error';
import {
  createSurveyRecord,
  deleteSurveyRecord,
  getSurveyResult,
} from '@/server/survey/repository';
import type { CreateFormInput } from '@/server/survey/types';
import { SurveyCreateSchema } from '@/app/schemas/survey-create-schema';
import { ZodError } from 'zod';
import { validateSlug } from '@/utils/validators';

// Функция для обработки и валидации данных из запроса на создание нового опроса
export function parseCreateSurveyInput(body: Record<string, unknown>): CreateFormInput {
  try {
    const parsed = SurveyCreateSchema.parse(body);
    const places = parsed.places.map((item) => {
      if (typeof item === 'string') {
        return { name: item, link: null };
      }
      return { name: item.name, link: item.link || null };
    });
    const people = parsed.people.map((name) => name.trim());

    if (places.length === 0) {
      throw new HttpError('Необходимо добавить хотя бы одно место.', 400);
    }

    if (people.length === 0) {
      throw new HttpError('Необходимо добавить хотя бы одного участника.', 400);
    }

    return { places, people };
  } catch (_e) {
    throw new HttpError('Неверные данные.', 400);
  }
}

// Функция для создания нового опроса
export function createSurvey(body: Record<string, unknown>) {
  const input = parseCreateSurveyInput(body);

  return createSurveyRecord(input);
}

// Функция для получения данных опроса по slug
export function getSurvey(slug: string) {
  if (!validateSlug(slug)) {
    throw new HttpError('Неверные данные.', 400);
  }

  return getSurveyResult(slug);
}

// Функция для удаления опроса по slug
export function deleteSurvey(slug: string): boolean {
  if (!validateSlug(slug)) {
    throw new HttpError('Неверные данные.', 400);
  }

  return deleteSurveyRecord(slug);
}
