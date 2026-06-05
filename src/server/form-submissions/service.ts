import 'server-only';

import { HttpError } from '@/server/http-error';
import { createFormSubmission } from '@/server/form-submissions/repository';
import type {
  CreateFormSubmissionInput,
  SubmittedPlaceInput,
} from '@/server/form-submissions/types';
import { validateSlug } from '@/utils/validators';
import { SurveySubmissionSchema } from '@/app/schemas/survey-submission-schema';

// Функция для обработки и валидации данных из запроса на создание новой записи формы
export function parseCreateFormSubmissionInput(
  slug: string,
  body: Record<string, unknown>,
): CreateFormSubmissionInput {
  if (!validateSlug(slug)) {
    throw new HttpError('Неверные данные.', 400);
  }

  const parsed = SurveySubmissionSchema.parse(body);
  const userId = parsed.userId;
  const places = parsed.places;

  return {
    slug,
    userId,
    places,
  };
}

export function createFormSubmissionRecord(slug: string, body: Record<string, unknown>) {
  const input = parseCreateFormSubmissionInput(slug, body);

  return createFormSubmission(input);
}
