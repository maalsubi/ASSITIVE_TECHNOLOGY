import { useState } from "react";
import { ArrowUpRight, LoaderCircle, CheckCircle2 } from "lucide-react";
import { contactSchema } from "../../../shared/contact";
import { Heading } from "./Story";
export default function Contact() {
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      setStatus("error");
      setMessage("Please check the highlighted fields.");
      return;
    }
    setErrors({});
    setMessage("");
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        signal: AbortSignal.timeout(15000),
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.message || "Unable to submit your inquiry.");
      setStatus("success");
      setMessage(
        `Your inquiry has been received. Reference: ${json.reference}`,
      );
      form.reset();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Please try again.");
    }
  }
  return (
    <div className="contact">
      <div>
        <Heading number="05" label="START A CONVERSATION">
          LET’S BUILD
          <br />
          WHAT’S NEXT<span className="red">.</span>
        </Heading>
        <p>
          Interested in the technology, collaboration, or learning more? Get in
          touch with Techo Spark Industries.
        </p>
        <span className="contact-note">
          ASSISTIVE TECHNOLOGY. SHARED POSSIBILITIES.
        </span>
      </div>
      <form onSubmit={submit} noValidate>
        <div className="form-grid">
          {[
            ["name", "Full name", "text"],
            ["email", "Email", "email"],
            ["organization", "Organization", "text"],
            ["subject", "Subject", "text"],
          ].map(([name, label, type]) => (
            <label key={name} htmlFor={name}>
              {label}
              {name !== "organization" ? " *" : " (optional)"}
              <input
                id={name}
                name={name}
                type={type}
                required={name !== "organization"}
                maxLength={name === "email" ? 254 : name === "name" ? 100 : 150}
                autoComplete={
                  name === "name"
                    ? "name"
                    : name === "email"
                      ? "email"
                      : name === "organization"
                        ? "organization"
                        : "off"
                }
                aria-invalid={!!errors[name]}
                aria-describedby={errors[name] ? `${name}-error` : undefined}
              />
              {errors[name] && (
                <span className="field-error" id={`${name}-error`}>
                  {errors[name]?.[0]}
                </span>
              )}
            </label>
          ))}
        </div>
        <label htmlFor="message">
          Message *
          <textarea
            name="message"
            id="message"
            rows={4}
            maxLength={5000}
            required
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "message-error" : undefined}
          />
          {errors.message && (
            <span className="field-error" id="message-error">
              {errors.message[0]}
            </span>
          )}
        </label>
        <div className="honeypot" aria-hidden="true">
          <label>
            Leave blank
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <p className="form-note">
          Your details are used to handle your inquiry.
        </p>
        <button
          className="button"
          type="submit"
          disabled={status === "loading"}
        >
          {status === "loading" ? "SENDING…" : "SEND INQUIRY"}
          {status === "loading" ? (
            <LoaderCircle className="spin" size={17} />
          ) : (
            <ArrowUpRight size={17} />
          )}
        </button>
        <div
          className={`form-status ${status}`}
          role="status"
          aria-live="polite"
        >
          {status === "success" && <CheckCircle2 size={18} />} {message}
        </div>
      </form>
    </div>
  );
}
