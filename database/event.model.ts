import mongoose, { Document, Schema } from "mongoose";

/**
 * Interface for Event document with all required fields
 */
interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Event Schema with validation and auto-generation of slug
 */
const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    mode: {
      type: String,
      enum: {
        values: ["online", "offline", "hybrid"],
        message: "Mode must be online, offline, or hybrid",
      },
      required: [true, "Mode is required"],
    },
    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "Agenda must have at least one item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "At least one tag is required",
      },
    },
  },
  { timestamps: true },
);

/**
 * Pre-save hook to generate slug from title and normalize date/time formats
 * - Only regenerates slug if title has changed
 * - Normalizes date to ISO format (YYYY-MM-DD)
 * - Ensures time is in HH:MM format
 */
eventSchema.pre<IEvent>("save", function () {
  // Generate slug only if title is modified or slug doesn't exist
  if (this.isModified("title") || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/[\s_]+/g, "-") // Replace spaces/underscores with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

  // Normalize date to ISO format (YYYY-MM-DD)
  if (this.isModified("date")) {
    const dateObj = new Date(this.date);
    if (!isNaN(dateObj.getTime())) {
      this.date = dateObj.toISOString().split("T")[0];
    }
  }

  // Normalize time format to HH:MM (24-hour format)
  if (this.isModified("time")) {
    const timeRegex = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(this.time)) {
      const timeObj = new Date(`1970-01-01T${this.time}`);
      if (!isNaN(timeObj.getTime())) {
        this.time = timeObj.toISOString().substring(11, 16);
      }
    }
  }
});

/**
 * Create or retrieve Event model with IEvent interface
 */
const Event =
  mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema);

export default Event;
export type { IEvent };
