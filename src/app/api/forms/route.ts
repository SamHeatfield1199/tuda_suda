import { NextResponse } from "next/server";
import { createFormRecord } from "@/server/forms/service";
import { HttpError } from "@/server/http-error";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createFormRecord(body);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating form:', error);

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
        error: "Unexpected server error",
      },
      { status: 500 },
    );
  }
}
