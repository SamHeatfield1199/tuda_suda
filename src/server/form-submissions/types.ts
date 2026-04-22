import "server-only";

export type SubmittedPlaceInput = {
  id: string;
  name: string;
};

export type CreateFormSubmissionInput = {
  slug: string;
  places: SubmittedPlaceInput[];
};

export type FormSubmissionRecord = {
  id: string;
  slug: string;
  places: SubmittedPlaceInput[];
  createdAt: string;
};
