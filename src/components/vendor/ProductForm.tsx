"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import type { ProductCategory } from "@/generated/prisma/enums";
import styles from "./ProductForm.module.css";

type ProductFormValues = {
  title: string;
  category: ProductCategory;
  description: string;
  price: string;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK";
  images: string[];
};

type Props = {
  mode: "create" | "edit";
  productId?: string;
  initialValues?: Partial<ProductFormValues>;
};

export function ProductForm({ mode, productId, initialValues }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [category, setCategory] = useState<ProductCategory>(
    initialValues?.category ?? "SKINCARE",
  );
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [price, setPrice] = useState(initialValues?.price ?? "");
  const [stockStatus, setStockStatus] = useState<"IN_STOCK" | "OUT_OF_STOCK">(
    initialValues?.stockStatus ?? "IN_STOCK",
  );
  const [images, setImages] = useState<string[]>(initialValues?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.set("file", file);
    const response = await fetch("/api/vendor/products/upload-image", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Image upload failed.");
    } else {
      setImages((prev) => [...prev, data.url]);
    }
    setUploading(false);
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((image) => image !== url));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const payload = { title, category, description, price, stockStatus, images };
    const url =
      mode === "create"
        ? "/api/vendor/products"
        : `/api/vendor/products/${productId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Something went wrong.");
      setPending(false);
      return;
    }

    router.push("/vendor/products");
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={2}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as ProductCategory)}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          minLength={10}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="price">Price (₦)</label>
        <input
          id="price"
          type="number"
          min="1"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="stockStatus">Stock status</label>
        <select
          id="stockStatus"
          value={stockStatus}
          onChange={(e) =>
            setStockStatus(e.target.value as "IN_STOCK" | "OUT_OF_STOCK")
          }
        >
          <option value="IN_STOCK">In stock</option>
          <option value="OUT_OF_STOCK">Out of stock</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="image">Images</label>
        <div className={styles.images}>
          {images.map((url) => (
            <div key={url} className={styles.imageThumb}>
              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded URLs, not worth the remotePatterns churn for a thumbnail */}
              <img src={url} alt="" />
              <button
                type="button"
                className={styles.removeImage}
                onClick={() => removeImage(url)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={uploading}
        />
        {uploading && <p className={styles.hint}>Uploading…</p>}
        <p className={styles.hint}>
          Images are optional — you can add them later.
        </p>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.submit} type="submit" disabled={pending}>
        {pending
          ? "Saving…"
          : mode === "create"
            ? "Add product"
            : "Save changes"}
      </button>
    </form>
  );
}
