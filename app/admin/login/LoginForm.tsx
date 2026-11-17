"use client";

import { useState, type FormEvent } from "react";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      window.location.assign("/admin/comments");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to log in"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: "420px",
        margin: "90px auto",
        padding: "30px",
        border: "1px solid #ddd",
        borderRadius: "12px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Administrator Login</h1>
      <p>Muhanad — Comment Management</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="admin-password">
          Administrator password
        </label>

        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          style={{
            display: "block",
            width: "100%",
            boxSizing: "border-box",
            padding: "12px",
            marginTop: "10px",
            marginBottom: "18px",
          }}
        />

        <button
          type="submit"
          disabled={busy || !password}
          style={{
            width: "100%",
            padding: "12px",
            cursor: busy ? "wait" : "pointer",
          }}
        >
          {busy ? "Checking..." : "Sign in"}
        </button>
      </form>

      {error && (
        <p role="alert" style={{ color: "darkred", marginTop: "16px" }}>
          {error}
        </p>
      )}
    </main>
  );
}
