import { z } from 'zod';

export const SurveySubmissionSchema = z.object({
  userId: z.guid(),
  places: z.array(z.guid()).min(1, 'Нужно выбрать хотя бы одно место'),
});
