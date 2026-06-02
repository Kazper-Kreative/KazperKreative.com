/**
 * @jest-environment jsdom
 */
import { captureForm, inbox } from "./submissions";

// Force the localStorage fallback (no Supabase) so the test is offline.
jest.mock("./client", () => ({
  isSupabaseConfigured: () => false,
  getSupabase: () => null,
}));

beforeEach(() => {
  localStorage.clear();
});

function buildForm(): HTMLFormElement {
  const form = document.createElement("form");
  form.innerHTML = `
    <div class="field"><label>Name</label><input name="n" value="Ada Lovelace"></div>
    <div class="field"><label>Email</label><input name="e" value="ada@example.com"></div>
    <div class="field"><label>About the project</label><textarea>A configurator.</textarea></div>
    <button type="submit">Send</button>
  `;
  // jsdom doesn't reflect the textarea's value from markup, set it explicitly.
  (form.querySelector("textarea") as HTMLTextAreaElement).value = "A configurator.";
  document.body.appendChild(form);
  return form;
}

describe("captureForm", () => {
  it("keys fields by their label text and skips the submit button", () => {
    const fields = captureForm(buildForm(), "Contact");
    expect(fields).toEqual({
      Name: "Ada Lovelace",
      Email: "ada@example.com",
      "About the project": "A configurator.",
    });
  });

  it("persists the submission to the localStorage fallback", async () => {
    captureForm(buildForm(), "Contact");
    const all = await inbox.fetchAll();
    expect(all).toHaveLength(1);
    expect(all[0].type).toBe("Contact");
    expect(all[0].fields.Name).toBe("Ada Lovelace");
  });
});
