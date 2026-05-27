import 'server-only';

// Выбранные места
export type SubmittedPlaceInput = {
  id: string;
  name: string;
};

// Входные данные для создания новой записи формы
export type CreateFormSubmissionInput = {
  slug: string;
  userId: string;
  places: SubmittedPlaceInput[];
};

// Запись формы, сохраненная в базе данных
export type FormSubmissionRecord = {
  id: string;
  slug: string;
  userId: string;
  places: SubmittedPlaceInput[];
  createdAt: string;
};
