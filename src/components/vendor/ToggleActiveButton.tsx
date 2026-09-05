"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ToggleActiveButton({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    await fetch(`/api/vendor/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
    setPending(false);
  }

  return (
    <button onClick={handleClick} disabled={pending}>
      {isActive ? "Deactivate" : "Reactivate"}
    </button>
  );
}
