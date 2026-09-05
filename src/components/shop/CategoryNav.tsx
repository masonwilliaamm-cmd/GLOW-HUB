import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export function CategoryNav({ currentSlug }: { currentSlug?: string }) {
  return (
    <nav style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
      <Link
        href="/shop"
        style={{ fontWeight: currentSlug ? 400 : 700 }}
      >
        All
      </Link>
      {CATEGORIES.map((c) => (
        <Link
          key={c.slug}
          href={`/shop/${c.slug}`}
          style={{ fontWeight: currentSlug === c.slug ? 700 : 400 }}
        >
          {c.label}
        </Link>
      ))}
    </nav>
  );
}
