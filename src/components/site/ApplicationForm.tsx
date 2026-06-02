"use client";

import { useState } from "react";
import { captureForm } from "@/lib/supabase/submissions";

export default function ApplicationForm() {
  const [sent, setSent] = useState(false);

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
      onSubmit={(e) => {
        e.preventDefault();
        captureForm(e.currentTarget, "Application");
        setSent(true);
      }}
    >
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
      <button type="submit" className="btn btn-fill btn-lg" style={{ justifyContent: "center" }}>
        Submit application <span className="arrow">→</span>
      </button>
    </form>
  );
}
