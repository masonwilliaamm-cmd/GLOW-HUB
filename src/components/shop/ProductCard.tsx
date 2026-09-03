import Link from "next/link";
import Image from "next/image";
import type { Prisma } from "@/generated/prisma/client";
import styles from "./ProductCard.module.css";

type ProductWithVendor = Prisma.ProductGetPayload<{
  include: { vendor: true };
}>;

export function ProductCard({ product }: { product: ProductWithVendor }) {
  const image = product.images[0];

  return (
    <Link href={`/products/${product.id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        {image ? (
          <Image src={image} alt={product.title} fill sizes="(max-width: 600px) 50vw, 25vw" />
        ) : (
          <div className={styles.placeholder}>No image</div>
        )}
      </div>
      <div className={styles.body}>
        <span className={styles.title}>{product.title}</span>
        <span className={styles.vendor}>{product.vendor.businessName}</span>
        <span className={styles.price}>₦{product.price.toString()}</span>
        {product.stockStatus === "OUT_OF_STOCK" && (
          <span className={styles.badge}>Out of stock</span>
        )}
      </div>
    </Link>
  );
}
