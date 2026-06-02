"use client";

import { useState } from "react";
import { captureForm, isHoneypotFilled } from "@/lib/supabase/submissions";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

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
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        // Bot filled the honeypot — show success but don't store anything.
        if (isHoneypotFilled(form)) {
          setSent(true);
          return;
        }
        captureForm(form, "Contact");
        setSent(true);
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
        <label>Company / Studio</label>
        <input type="text" placeholder="Optional" />
      </div>
      <div className="row-2">
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
      <button type="submit" className="btn btn-fill btn-lg" style={{ justifyContent: "center" }}>
        Send inquiry <span className="arrow">→</span>
      </button>
    </form>
  );
}
