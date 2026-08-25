"use client";

import { useRef, useState } from "react";
import { careers } from "@/content/careers";
import type { JobPublic } from "@/lib/api/types";
import { Icons } from "@/components/art/Icons";
import { ApiRequestError } from "@/lib/api/client";
import { publicApi } from "@/lib/api/public";

const { form } = careers;

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = ".pdf,.doc,.docx";

/**
 * Keyed by the API's field names, not the input names.
 *
 * They used to differ - `first` against `first_name`, and `linkedin_url` was
 * missing entirely - and an `as Errors` cast hid it from the compiler. Server
 * rejections landed on keys nothing rendered, and because the summary was only
 * shown when there were no field errors at all, the form went completely
 * silent: no message, no movement, nothing to correct.
 */
/** The fields this form has somewhere to render an error. */
const FIELD_LABELS = {
  first_name: "First name",
  last_name: "Last name",
  email: "Email",
  phone: "Phone",
  linkedin_url: "LinkedIn",
  resume: "Resume",
} as const;

type Errors = Partial<
  Record<
    | "first_name"
    | "last_name"
    | "email"
    | "phone"
    | "linkedin_url"
    | "github_url"
    | "resume",
    string
  >
>;

export function ApplyForm({ job }: { job: JobPublic }) {
  const [errors, setErrors] = useState<Errors>({});
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resumeWarning, setResumeWarning] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function acceptFile(f: File | undefined) {
    if (!f) return;
    if (f.size > MAX_BYTES) {
      setErrors((e) => ({ ...e, resume: "That file is over 10MB." }));
      return;
    }
    if (!/\.(pdf|docx?)$/i.test(f.name)) {
      setErrors((e) => ({ ...e, resume: "Use a PDF, DOC, or DOCX file." }));
      return;
    }
    setErrors((e) => ({ ...e, resume: undefined }));
    setFile(f);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Errors = {};

    if (!String(data.get("first_name") ?? "").trim()) next.first_name = "Required";
    if (!String(data.get("last_name") ?? "").trim()) next.last_name = "Required";

    const email = String(data.get("email") ?? "").trim();
    if (!email) next.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email";

    if (!file) next.resume = "Attach your resume";

    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    setSubmitError(null);
    try {
      // Two steps on purpose. The details are saved first, so a candidate is
      // never lost because the file upload failed on a bad connection.
      const receipt = await publicApi.apply({
        job_id: job.id,
        first_name: String(data.get("first_name") ?? "").trim(),
        last_name: String(data.get("last_name") ?? "").trim(),
        email,
        // Sent as typed rather than coerced to null when blank: these are
        // required, and turning an empty field into null asks the API to
        // report a missing key instead of an empty value, which is a worse
        // message for the person looking at the form.
        phone: String(data.get("phone") ?? "").trim(),
        linkedin_url: String(data.get("linkedin_url") ?? "").trim(),
        github_url: String(data.get("github_url") ?? "").trim(),
      });

      if (file) {
        try {
          await publicApi.uploadResume(receipt.id, file);
        } catch (uploadError) {
          // The application itself is already recorded, so say what happened
          // rather than implying the whole thing failed.
          setSent(true);
          setResumeWarning(
            uploadError instanceof ApiRequestError
              ? `Your application was received, but the resume did not upload: ${uploadError.summary}`
              : "Your application was received, but the resume did not upload."
          );
          return;
        }
      }

      setSent(true);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        // Keep only the fields this form can actually show, and fall back to
        // the summary whenever anything could not be placed. Suppressing the
        // summary because "there were field errors" is what made an
        // unrenderable error look like nothing happening.
        const placeable: Errors = {};
        let unplaced = false;
        for (const [field, message] of Object.entries(err.fieldErrors)) {
          if (field in FIELD_LABELS) placeable[field as keyof Errors] = message;
          else unplaced = true;
        }
        setErrors(placeable);
        setSubmitError(
          Object.keys(placeable).length && !unplaced ? null : err.summary
        );
      } else {
        setSubmitError("Something went wrong sending your application.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-[var(--color-rule)] bg-white p-6">
        <div className="grid size-10 place-items-center rounded-full bg-[#eafaef]">
          <svg viewBox="0 0 24 24" className="size-5 text-[#1a8f43]" fill="none">
            <path
              d="m5 12.5 4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-lg">{form.success.title}</h3>
        <p className="mt-2 text-[14px] leading-[1.6] text-[var(--color-muted)]">
          {resumeWarning ?? form.success.body}
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setFile(null);
          }}
          className="mt-5 font-mono text-[14px] text-[var(--color-accent)] uppercase"
        >
          {form.success.again}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="overflow-hidden rounded-xl border border-[var(--color-rule)] bg-white"
    >
      <div className="border-b border-[var(--color-rule)] px-6 py-5">
        <h2 className="text-lg">{form.heading}</h2>
        <p className="mt-0.5 text-[14px] text-[var(--color-muted)]">{job.title}</p>
      </div>

      <div className="flex flex-col gap-5 px-6 py-6">
        {submitError && (
          <p className="rounded-md bg-[#fdeeed] px-3 py-2 text-[13px] text-[#9c2820]">
            {submitError}
          </p>
        )}

        <h3 className="text-[15px] font-medium">{form.sections.personal}</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={form.fields.first} name="first_name" required error={errors.first_name} />
          <Field label={form.fields.last} name="last_name" required error={errors.last_name} />
        </div>

        <Field
          label={form.fields.email}
          name="email"
          type="email"
          required
          error={errors.email}
        />
        {/* All required now. The asterisks matter more than usual here: the
            API refuses the submission without them, so a field that looks
            optional is a form that fails after the applicant has finished. */}
        <Field
          label={form.fields.phone}
          name="phone"
          type="tel"
          required
          error={errors.phone}
        />
        <Field
          label={form.fields.linkedin}
          name="linkedin_url"
          type="url"
          required
          error={errors.linkedin_url}
          placeholder={form.fields.linkedinPlaceholder}
        />
        <Field
          label={form.fields.github}
          name="github_url"
          type="url"
          required
          error={errors.github_url}
          placeholder={form.fields.githubPlaceholder}
        />

        <h3 className="mt-1 text-[15px] font-medium">{form.sections.resume}</h3>

        <div>
          <label className="mb-1.5 block text-[13px]">
            {form.fields.upload} <span className="text-[var(--color-accent)]">*</span>
          </label>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              acceptFile(e.dataTransfer.files?.[0]);
            }}
            className={`flex w-full flex-col items-center gap-1.5 rounded-lg border border-dashed px-4 py-7 transition-colors ${
              dragging
                ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                : errors.resume
                  ? "border-[#e8a0a0]"
                  : "border-[#d8d8d5] hover:border-[var(--color-muted)]"
            }`}
          >
            <Icons.share className="size-5 text-[var(--color-muted)]" />
            <span className="text-[13px] text-[var(--color-muted)]">
              {file ? file.name : form.fields.dropzone}
            </span>
            <span className="text-[11px] text-[var(--color-muted)]">
              {file
                ? `${(file.size / 1024 / 1024).toFixed(1)}MB — click to replace`
                : form.fields.dropzoneHint}
            </span>
          </button>

          <input
            ref={inputRef}
            type="file"
            name="resume"
            accept={ACCEPT}
            className="sr-only"
            onChange={(e) => acceptFile(e.target.files?.[0])}
          />
          {errors.resume && (
            <p className="mt-1.5 text-[12px] text-[#c0392b]">{errors.resume}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="mt-2 w-full rounded-lg bg-[#1b1b1b] py-3.5 text-[14px] text-white transition-colors hover:bg-[#000] disabled:opacity-60"
        >
          {busy ? "Sending…" : form.submit}
        </button>

        <p className="text-center text-[12px] leading-[1.5] text-[var(--color-muted)]">
          {form.disclaimer}
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-[13px]">
        {label}{" "}
        {required && <span className="text-[var(--color-accent)]">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={`w-full rounded-lg border px-3 py-2.5 text-[14px] outline-none transition-colors placeholder:text-[#b9b9b6] focus:border-[var(--color-accent)] ${
          error ? "border-[#e8a0a0]" : "border-[var(--color-rule)]"
        }`}
      />
      {error && <p className="mt-1.5 text-[12px] text-[#c0392b]">{error}</p>}
    </div>
  );
}
