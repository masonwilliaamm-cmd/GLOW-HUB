"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { parseJsonResponse } from "@/lib/parseJsonResponse";
import styles from "./AuthForm.module.css";

export function VendorOnboardingForm() {
  const router = useRouter();
  const [trustTier, setTrustTier] = useState<"READY_STOCK" | "MADE_TO_ORDER">(
    "READY_STOCK",
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      businessName: formData.get("businessName"),
      trustTier,
      payoutAccountDetails: formData.get("payoutAccountDetails"),
    };

    try {
      const response = await fetch("/api/vendor/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await parseJsonResponse(response);

      if (!response.ok) {
        setError(data.error ?? `Something went wrong (${response.status}).`);
        return;
      }

      router.push(data.redirectTo as string);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="businessName">Business name</label>
        <input id="businessName" name="businessName" required minLength={2} />
      </div>

      <div className={styles.field}>
        <label htmlFor="trustTier">Stock model</label>
        <select
          id="trustTier"
          name="trustTier"
          value={trustTier}
          onChange={(e) =>
            setTrustTier(e.target.value as "READY_STOCK" | "MADE_TO_ORDER")
          }
        >
          <option value="READY_STOCK">Ready stock</option>
          <option value="MADE_TO_ORDER">Made to order</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="payoutAccountDetails">Payout account details</label>
        <input
          id="payoutAccountDetails"
          name="payoutAccountDetails"
          required
          minLength={4}
          placeholder="Bank name + account number"
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.submit} type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit for verification"}
      </button>
    </form>
  );
}
