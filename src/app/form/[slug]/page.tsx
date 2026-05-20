import { notFound } from "next/navigation";
import { HttpError } from "@/server/http-error";
import { getSurvey } from "@/server/survey/service";
import SurveyClient from "./SurveyClient";
import type { FormRecord } from "@/server/survey/types";

type SurveyPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// Страница для отображения формы опроса
export default async function SurveyPage({ params }: SurveyPageProps) {
  const { slug } = await params;
  let survey: FormRecord;

  try {
    survey = getSurvey(slug);
  } catch (error) {
    if (error instanceof HttpError || error instanceof Error) {
      notFound();
    }

    throw error;
  }

  return (
    <SurveyClient
      slug={slug}
      places={survey.places}
      people={survey.people}
    />
  );
}
