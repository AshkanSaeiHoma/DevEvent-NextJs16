import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Event, { type IEvent } from "@/database/event.model";

interface RouteSegmentParams {
  slug: string;
}

/**
 * GET handler to fetch event details by slug
 * Returns event data as JSON or appropriate error responses
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteSegmentParams> },
) {
  try {
    // Extract and validate slug parameter
    const { slug } = await params;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { message: "Invalid slug parameter" },
        { status: 400 },
      );
    }

    const trimmedSlug = slug.trim().toLowerCase();

    if (trimmedSlug.length === 0) {
      return NextResponse.json(
        { message: "Slug cannot be empty" },
        { status: 400 },
      );
    }

    if (trimmedSlug.length > 200) {
      return NextResponse.json(
        { message: "Slug exceeds maximum length" },
        { status: 400 },
      );
    }

    // Connect to database
    await connectDB();

    // Query event by slug
    const event: IEvent | null = await Event.findOne({ slug: trimmedSlug });

    if (!event) {
      return NextResponse.json(
        { message: `Event with slug "${trimmedSlug}" not found` },
        { status: 404 },
      );
    }

    // Return successful response with event data
    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    // Log error for debugging
    console.error("GET /api/events/[slug] error:", error);

    // Handle different error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: "Invalid request format" },
        { status: 400 },
      );
    }

    // Generic server error
    return NextResponse.json(
      { message: "Failed to fetch event details" },
      { status: 500 },
    );
  }
}
