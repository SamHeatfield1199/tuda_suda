import { notFound } from 'next/navigation';
import { HttpError } from '@/server/http-error';
import { getSurvey } from '@/server/survey/service';
import type { FormRecord } from '@/server/survey/types';
import ResultsClient from './ResultsClient';

type ResultsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// Страница для отображения результатов опроса
export default async function ResultsPage({ params }: ResultsPageProps) {
  const { slug } = await params;
  let survey: FormRecord | null = null;

  try {
    survey = getSurvey(slug);
  } catch (error) {
    if (error instanceof HttpError) {
      notFound();
    }

    throw error;
  }

  if (!survey) {
    notFound();
  }

  return <ResultsClient slug={survey.slug} places={survey.places} people={survey.people} />;
}
