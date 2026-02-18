import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Event from "@/database/event.model";
import { v2 as cloudinary } from "cloudinary";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    cloudinary.config({
      secure: true,
    });

    let event;
    let formData: FormData | null = null;
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
      formData = await req.formData();
      event = Object.fromEntries(formData.entries());

      const file = formData.get("image") as File;
      if (!file) {
        return NextResponse.json(
          { message: "Image file is required" },
          { status: 400 },
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { resource_type: "image", folder: "DevEvent" },
            (error, results) => {
              if (error) return reject(error);
              resolve(results);
            },
          )
          .end(buffer);
      });

      event.image = (uploadResult as { secure_url: string }).secure_url;
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

    let tags: unknown[] = [];
    let agenda: unknown[] = [];
    if (formData) {
      const tagsValue = formData.get("tags");
      const agendaValue = formData.get("agenda");
      try {
        tags = tagsValue ? JSON.parse(tagsValue as string) : [];
      } catch {
        tags = [];
      }
      try {
        agenda = agendaValue ? JSON.parse(agendaValue as string) : [];
      } catch {
        agenda = [];
      }
    } else {
      tags = (event && (event as { tags?: unknown[] }).tags) || [];
      agenda = (event && (event as { agenda?: unknown[] }).agenda) || [];
    }

    const createdEvent = await Event.create({
      ...event,
      tags: tags,
      agenda: agenda,
    });
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

export async function GET() {
  try {
    await connectDB();

    const events = await Event.find().sort({ createdAt: -1 });

    return NextResponse.json(
      {
        message: "Events fetched successfully",
        events,
      },
      { status: 200 },
    );
  } catch (e) {
    return NextResponse.json(
      { message: "Event fetching failed", error: e },
      { status: 500 },
    );
  }
}
