import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { findPublicProduct } from "@/lib/products";
import { categoryLabel } from "@/lib/categories";

export default async function ProductPage(
  props: PageProps<"/products/[productId]">,
) {
  const { productId } = await props.params;

  const product = await findPublicProduct(productId);
  if (!product) notFound();

  return (
    <main style={{ padding: "2rem", maxWidth: "40rem", margin: "0 auto" }}>
      {product.images.length > 0 ? (
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            overflowX: "auto",
            marginBottom: "1rem",
          }}
        >
          {product.images.map((url) => (
            <div
              key={url}
              style={{ position: "relative", width: "12rem", height: "12rem", flexShrink: 0 }}
            >
              <Image
                src={url}
                alt={product.title}
                fill
                sizes="12rem"
                style={{ objectFit: "cover", borderRadius: "8px" }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            height: "16rem",
            background: "#f4f4f4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#999",
            marginBottom: "1rem",
            borderRadius: "8px",
          }}
        >
          No image
        </div>
      )}

      <p style={{ color: "#666", fontSize: "0.85rem" }}>
        {categoryLabel(product.category)}
      </p>
      <h1>{product.title}</h1>
      <p style={{ fontSize: "1.25rem", fontWeight: 600 }}>
        ₦{product.price.toString()}
      </p>
      <p>
        {product.stockStatus === "IN_STOCK" ? "In stock" : "Out of stock"}
      </p>
      <p>{product.description}</p>
      <p>
        Sold by{" "}
        <Link href={`/vendors/${product.vendor.id}`}>
          {product.vendor.businessName}
        </Link>
      </p>
    </main>
  );
}
