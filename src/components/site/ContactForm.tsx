"use client";

import { useState } from "react";
import {
  extractFields,
  isHoneypotFilled,
  submitForm,
} from "@/lib/supabase/submissions";
import Turnstile from "@/components/site/Turnstile";
import { EMAIL_PATTERN } from "@/lib/validation";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (sent) {
    return (
      <div className="card" style={{ padding: 44, textAlign: "center" }}>
        <div style={{ fontSize: 42 }} className="grad-text">
          ✓
        </div>
        <h3 style={{ margin: "14px 0 8px" }}>Message sent</h3>
        <p className="dim">
          Thanks for reaching out, we&apos;ll reply within one business day.
        </p>
      </div>
    );
  }

  return (
    <form
      className="form card"
      style={{ padding: 32 }}
      data-reveal
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (isHoneypotFilled(form)) {
          setSent(true);
          return;
        }
        setError("");
        setSubmitting(true);
        const res = await submitForm("Contact", extractFields(form), token);
        setSubmitting(false);
        if (res.ok) setSent(true);
        else setError(res.error || "Something went wrong. Please try again.");
      }}
    >
      <input
        type="text"
        name="company_url"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hp-field"
        data-hp
      />
      <div className="field-row">
        <div className="field">
          <label>Name</label>
          <input type="text" required placeholder="Your name" />
        </div>
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            required
            pattern={EMAIL_PATTERN}
            title="Enter a valid email address, e.g. you@studio.com"
            placeholder="you@email.com"
          />
        </div>
      </div>
      <div className="field">
        <label>Company / Studio</label>
        <input type="text" placeholder="Optional" />
      </div>
      <div className="field-row">
        <div className="field">
          <label>Project type</label>
          <select required defaultValue="">
            <option value="">Select…</option>
            <option>Unreal Engine build</option>
            <option>Game / Studio project</option>
            <option>Brand &amp; Identity</option>
            <option>Web &amp; Interactive</option>
            <option>Cinematics / VP</option>
            <option>Not sure yet</option>
          </select>
        </div>
        <div className="field">
          <label>Budget</label>
          <select defaultValue="">
            <option value="">Select…</option>
            <option>Under $10k</option>
            <option>$10k – $50k</option>
            <option>$50k – $150k</option>
            <option>$150k+</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label>About the project</label>
        <textarea required placeholder="What are you trying to build, and by when?" />
      </div>
      <Turnstile onVerify={setToken} />
      {error && (
        <p className="dim" style={{ color: "#ff6b6b", fontSize: 14 }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        className="btn btn-fill btn-lg"
        style={{ justifyContent: "center" }}
        disabled={submitting}
      >
        {submitting ? "Sending…" : "Send inquiry"} <span className="arrow">→</span>
      </button>
    </form>
  );
}
