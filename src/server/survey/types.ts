import 'server-only';

export type CreateFormInput = {
  places: FormPlaceInput[];
  people: string[];
};

export type FormPlaceInput = {
  name: string;
  link: string | null;
};

export type FormPerson = {
  id: string;
  name: string;
};

export type FormPlace = {
  id: string;
  name: string;
  link: string | null;
  people?: string[];
};

export type FormRecord = {
  id: string;
  slug: string;
  people: FormPerson[];
  places: FormPlace[];
  createdAt: string;
};
