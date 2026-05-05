import "server-only";

export type SubmittedPlaceInput = {
  id: string;
  name: string;
};

export type CreateFormSubmissionInput = {
  slug: string;
  userId: string;
  places: SubmittedPlaceInput[];
};

export type FormSubmissionRecord = {
  id: string;
  slug: string;
  userId: string;
  places: SubmittedPlaceInput[];
  createdAt: string;
};
