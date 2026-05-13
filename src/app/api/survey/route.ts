import { NextResponse } from "next/server";
import {createSurveyRecord} from "@/server/survey/service";
import { HttpError } from "@/server/http-error";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createSurveyRecord(body);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Ошибка получения формы:', error);

    if (error instanceof HttpError) {
      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        error: "Неожиданная ошибка сервера",
      },
      { status: 500 },
    );
  }
}
