"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) {
      router.refresh();
      return;
    }
    const json = (await res?.json().catch(() => null)) as { error?: string } | null;
    setError(json?.error ?? "Couldn't reach the server.");
  };

  return (
    <main className="adm adm--center">
      <form className="adm-card adm-login" onSubmit={submit}>
        <span className="adm-kicker">Restricted</span>
        <h1>Admin</h1>
        <label className="adm-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            autoFocus
            required
          />
        </label>
        {error ? (
          <p className="adm-error" role="alert">
            {error}
          </p>
        ) : null}
        <button className="btn btn--fill" type="submit" disabled={busy}>
          {busy ? "Checking…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
