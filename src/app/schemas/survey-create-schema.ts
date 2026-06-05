import { z } from 'zod';

const PlaceSchema = z.union([
  z.string().trim(),
  z.object({
    name: z.string().min(1).trim(),
    link: z
      .string()
      .nullable()
      .optional()
      .transform((val) => val?.trim()),
  }),
]);

export const SurveyCreateSchema = z.object({
  places: z.array(PlaceSchema).min(1, 'Список мест не может быть пустым'),
  people: z.array(z.string().trim().min(1)).min(1, 'Список людей не может быть пустым'),
});
