import {NextRequest, NextResponse} from "next/server";
import {HttpError} from "@/server/http-error";
import {createFormSubmissionRecord} from "@/server/form-submissions/service";
import {getSurvey} from "@/server/survey/service";

type RouteContext = {
    params: Promise<{
        slug: string;
    }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const {slug} = await context.params;
        const data = createFormSubmissionRecord(slug, await request.json());

        return NextResponse.json(data, {status: 201});
    } catch (error) {
        if (error instanceof HttpError) {
            return NextResponse.json(
                {
                    error: error.message,
                    details: error.details,
                },
                {status: error.status},
            );
        }

        return NextResponse.json(
            {
                error: "Неожиданная ошибка сервера",
            },
            {status: 500},
        );
    }
}

export async function GET(_request: NextRequest, context: RouteContext) {
    try {
        const {slug} = await context.params;
        const data = getSurvey(slug);

        return NextResponse.json(data, {status: 200});
    } catch (error) {
        if (error instanceof HttpError) {
            return NextResponse.json(
                {
                    error: error.message,
                    details: error.details,
                },
                {status: error.status},
            );
        }

        return NextResponse.json(
            {
                error: "Unexpected server error",
            },
            {status: 500},
        );
    }
}
