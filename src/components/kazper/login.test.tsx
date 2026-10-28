import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import KazperLogin from "@/components/kazper/KazperLogin";

const refresh = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
const signInWithOtp = jest.fn();
const verifyOtp = jest.fn();
jest.mock("@/lib/kazper/supabase", () => ({ getKazperSupabase: () => ({ auth: { signInWithOtp, verifyOtp } }) }));

beforeEach(() => jest.clearAllMocks());

async function requestCode(email = "owner@example.com") {
  fireEvent.change(screen.getByPlaceholderText("you@email.com"), { target: { value: email } });
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Send code" })));
}

describe("KazperLogin", () => {
  it("emails a code without ever creating an account", async () => {
    signInWithOtp.mockResolvedValue({ error: null });
    render(<KazperLogin />);
    await requestCode();
    expect(signInWithOtp).toHaveBeenCalledWith(expect.objectContaining({
      email: "owner@example.com",
      options: expect.objectContaining({ shouldCreateUser: false }),
    }));
    expect(screen.getByPlaceholderText("123456")).toBeInTheDocument();
  });

  it("doesn't reveal whether an address has an account", async () => {
    signInWithOtp.mockResolvedValue({ error: { message: "Signups not allowed for otp" } });
    render(<KazperLogin />);
    await requestCode("stranger@example.com");
    expect(screen.getByPlaceholderText("123456")).toBeInTheDocument();
    expect(screen.queryByText(/not allowed/i)).toBeNull();
  });

  it("signs this window in with the code", async () => {
    signInWithOtp.mockResolvedValue({ error: null });
    verifyOtp.mockResolvedValue({ error: null });
    render(<KazperLogin />);
    await requestCode();
    fireEvent.change(screen.getByPlaceholderText("123456"), { target: { value: "123 456" } });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Sign in" })));
    expect(verifyOtp).toHaveBeenCalledWith({ email: "owner@example.com", token: "123456", type: "email" });
    expect(refresh).toHaveBeenCalled();
  });

  it("says so when the code is wrong", async () => {
    signInWithOtp.mockResolvedValue({ error: null });
    verifyOtp.mockResolvedValue({ error: { message: "Token has expired or is invalid" } });
    render(<KazperLogin />);
    await requestCode();
    fireEvent.change(screen.getByPlaceholderText("123456"), { target: { value: "000000" } });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Sign in" })));
    expect(screen.getByText(/didn't work/)).toBeInTheDocument();
    expect(refresh).not.toHaveBeenCalled();
  });
});
