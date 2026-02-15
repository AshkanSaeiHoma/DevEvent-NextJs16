import mongoose, { Document, Schema } from "mongoose";
import Event from "./event.model";

/**
 * Interface for Booking document
 */
interface IBooking extends Document {
  eventId: mongoose.Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Booking Schema with email validation and event reference
 */
const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => {
          // RFC 5322 simplified email regex
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(v);
        },
        message: "Please provide a valid email address",
      },
    },
  },
  { timestamps: true },
);

/**
 * Index on eventId for faster queries
 */
bookingSchema.index({ eventId: 1 });

/**
 * Pre-save hook to verify that the referenced eventId exists in the Event collection
 * Prevents creating bookings for non-existent events
 */
bookingSchema.pre<IBooking>("save", async function () {
  if (this.isModified("eventId") || this.isNew) {
    const eventExists = await Event.findById(this.eventId);
    if (!eventExists) {
      throw new Error(
        `Event with ID ${this.eventId} does not exist. Cannot create booking for non-existent event.`,
      );
    }
  }
});

/**
 * Create or retrieve Booking model with IBooking interface
 */
const Booking =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;
export type { IBooking };
