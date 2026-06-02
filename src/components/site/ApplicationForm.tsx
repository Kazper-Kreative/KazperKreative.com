"use client";

import { useState } from "react";
import {
  extractFields,
  isHoneypotFilled,
  submitForm,
} from "@/lib/supabase/submissions";
import Turnstile from "@/components/site/Turnstile";

export default function ApplicationForm() {
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (sent) {
    return (
      <div className="card" style={{ padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 40 }} className="grad-text">
          ✓
        </div>
        <h3 style={{ margin: "14px 0 8px" }}>Application received</h3>
        <p className="dim">Thanks, we&apos;ll be in touch. Welcome to the frontier.</p>
      </div>
    );
  }

  return (
    <form
      className="form card"
      style={{ padding: 30 }}
      data-reveal
      data-delay="1"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (isHoneypotFilled(form)) {
          setSent(true);
          return;
        }
        setError("");
        setSubmitting(true);
        const res = await submitForm("Application", extractFields(form), token);
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
      <div className="row-2">
        <div className="field">
          <label>Name</label>
          <input type="text" required placeholder="Your name" />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" required placeholder="you@email.com" />
        </div>
      </div>
      <div className="field">
        <label>Discipline</label>
        <select required defaultValue="">
          <option value="">Select one…</option>
          <option>Unreal Engine Dev</option>
          <option>3D / Environment Art</option>
          <option>Game Design</option>
          <option>Tech Art</option>
          <option>Brand / Web Design</option>
          <option>Production</option>
          <option>Other</option>
        </select>
      </div>
      <div className="field">
        <label>Portfolio / reel link</label>
        <input type="url" placeholder="https://" />
      </div>
      <div className="field">
        <label>What do you want to build?</label>
        <textarea placeholder="A few lines about your work and what you're after." />
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
        {submitting ? "Submitting…" : "Submit application"}{" "}
        <span className="arrow">→</span>
      </button>
    </form>
  );
}
