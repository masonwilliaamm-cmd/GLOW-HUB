"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./AuthForm.module.css";

export function SignupForm() {
  const router = useRouter();
  const [role, setRole] = useState<"BUYER" | "VENDOR">("BUYER");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      role,
    };

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Something went wrong.");
      setPending(false);
      return;
    }

    router.push(data.redirectTo);
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label>I am a</label>
        <div className={styles.roleGroup}>
          <label>
            <input
              type="radio"
              name="roleChoice"
              checked={role === "BUYER"}
              onChange={() => setRole("BUYER")}
            />
            Buyer
          </label>
          <label>
            <input
              type="radio"
              name="roleChoice"
              checked={role === "VENDOR"}
              onChange={() => setRole("VENDOR")}
            />
            Vendor
          </label>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="name">Full name</label>
        <input id="name" name="name" required minLength={2} />
      </div>

      <div className={styles.field}>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />
      </div>

      <div className={styles.field}>
        <label htmlFor="phone">Phone (optional)</label>
        <input id="phone" name="phone" type="tel" />
      </div>

      <div className={styles.field}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.submit} type="submit" disabled={pending}>
        {pending ? "Creating account…" : "Sign up"}
      </button>
    </form>
  );
}
