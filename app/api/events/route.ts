import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Event from "@/database/event.model";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    let event;
    const contentType = req.headers.get("content-type") || "";

    // Handle JSON requests
    if (contentType.includes("application/json")) {
      event = await req.json();
    }
    // Handle form data requests
    else if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const formData = await req.formData();
      event = Object.fromEntries(formData.entries());
    } else {
      return NextResponse.json(
        {
          message: "Invalid Content-Type",
          error:
            'Content-Type must be "application/json" or "multipart/form-data"',
        },
        { status: 400 },
      );
    }

    const createdEvent = await Event.create(event);
    return NextResponse.json(
      {
        message: "Event created successfully",
        event: createdEvent,
      },
      { status: 201 },
    );
  } catch (e) {
    console.error("Event creation error:", e);
    return NextResponse.json(
      {
        message: "Event Creation Failed",
        error: e instanceof Error ? e.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
