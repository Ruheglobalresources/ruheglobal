// src/components/ContactForm.tsx
"use client";

import { useState } from "react";

const SUBJECT_OPTIONS = [
  "Students' Visa",
  "Travel Abroad/Relocations",
  "Study abroad",
  "IELTS Classes",
  "Transfer Money",
];

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const INITIAL_STATE: FormState = {
  name: "",
  email: "",
  phone: "",
  subject: SUBJECT_OPTIONS[0],
  message: "",
};

type Status = "idle" | "submitting" | "success" | "error";

const ContactForm = () => {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [status, setStatus] = useState<Status>("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      // TODO: wire this up to an API route (e.g. /api/contact) or a
      // third-party form/email service once one is available.
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("success");
      setForm(INITIAL_STATE);
    } catch {
      setStatus("error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] sm:p-10"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-semibold text-ink">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="Your full name"
            className="rounded-xl border border-ink/10 bg-ink/[0.02] px-4 py-3 text-sm text-ink outline-none transition focus:border-ruby-600"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-semibold text-ink">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="rounded-xl border border-ink/10 bg-ink/[0.02] px-4 py-3 text-sm text-ink outline-none transition focus:border-ruby-600"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-sm font-semibold text-ink">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+234 ..."
            className="rounded-xl border border-ink/10 bg-ink/[0.02] px-4 py-3 text-sm text-ink outline-none transition focus:border-ruby-600"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="subject" className="text-sm font-semibold text-ink">
            Subject
          </label>
          <select
            id="subject"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className="rounded-xl border border-ink/10 bg-ink/[0.02] px-4 py-3 text-sm text-ink outline-none transition focus:border-ruby-600"
          >
            {SUBJECT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-sm font-semibold text-ink">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={form.message}
          onChange={handleChange}
          placeholder="Tell us a bit about what you need help with..."
          className="resize-none rounded-xl border border-ink/10 bg-ink/[0.02] px-4 py-3 text-sm text-ink outline-none transition focus:border-ruby-600"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex w-full items-center justify-center rounded-full bg-ruby-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-ruby-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? "Sending..." : "Contact Us"}
      </button>

      {status === "success" && (
        <p className="text-sm font-medium text-emerald-600">
          Thanks for reaching out — our team will get back to you shortly.
        </p>
      )}
      {status === "error" && (
        <p className="text-sm font-medium text-red-600">
          Something went wrong sending your message. Please try again or
          reach us directly using the details below.
        </p>
      )}
    </form>
  );
};

export default ContactForm;