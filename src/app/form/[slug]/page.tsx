import { HttpError } from '@/server/http-error';
import { getSurvey } from '@/server/survey/service';
import SurveyClient from './SurveyClient';
import type { FormRecord } from '@/server/survey/types';
import router from 'next/router';

type SurveyPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// Страница для отображения формы опроса
export default async function SurveyPage({ params }: SurveyPageProps) {
  const { slug } = await params;
  let survey: FormRecord | null = null;

  try {
    survey = getSurvey(slug);
  } catch (error) {
    if (error instanceof HttpError || error instanceof Error) {
      router.push('/');
    }

    throw error;
  }

  if (!survey) {
    router.push('/');
  }

  return survey ? (
    <SurveyClient slug={survey.slug} places={survey.places} people={survey.people} />
  ) : null;
}
