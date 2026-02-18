"use client";

import { createBooking } from "@/lib/actions/booking.actions";
import { useState } from "react";

function BookEvent({ eventId, slug }: { eventId: string; slug: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await createBooking({ eventId, slug, email });
    const success = res?.success ?? false;

    if (success) {
      setSubmitted(true);
    } else {
      console.error("Booking creation failed");
    }
  };

  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-sm">Thank you for siging up!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
            />

            <button type="submit" className="button-submit mt-2">
              Submit
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default BookEvent;
