import { HttpError } from '@/server/http-error';
import { getSurvey } from '@/server/survey/service';
import SurveyClient from './SurveyClient';
import type { FormRecord } from '@/server/survey/types';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

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
    survey = await getSurvey(slug);
  } catch (error) {
    if (error instanceof HttpError) {
      notFound();
    }

    throw error;
  }

  if (!survey) {
    notFound();
  }

  return <SurveyClient slug={survey.slug} places={survey.places} people={survey.people} />;
}
