"use client";

import { useActionState } from "react";
import { type LoginState, loginAction } from "@/app/admin/login/actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input
        type="password"
        name="password"
        placeholder="Admin password"
        required
        className="rounded-[10px] border border-black/[0.12] px-4 py-3 font-sans text-[15px] outline-none"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer rounded-xl bg-rank-orange px-[26px] py-3.5 font-display text-sm font-bold text-white disabled:cursor-default disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
