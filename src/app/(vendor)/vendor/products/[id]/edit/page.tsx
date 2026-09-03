import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/vendor/ProductForm";

export default async function EditProductPage(
  props: PageProps<"/vendor/products/[id]/edit">,
) {
  const session = await requireRole("VENDOR");
  const { id } = await props.params;

  const vendorProfile = await db.vendorProfile.findUnique({
    where: { userId: session.userId },
  });
  if (!vendorProfile) redirect("/vendor/onboarding");

  const product = await db.product.findUnique({ where: { id } });
  if (!product || product.vendorId !== vendorProfile.id) notFound();

  return (
    <main style={{ padding: "2rem", maxWidth: "32rem", margin: "0 auto" }}>
      <h1>Edit product</h1>
      <p>
        <Link href="/vendor/products">← Back to products</Link>
      </p>
      <ProductForm
        mode="edit"
        productId={product.id}
        initialValues={{
          title: product.title,
          category: product.category,
          description: product.description,
          price: product.price.toString(),
          stockStatus: product.stockStatus,
          images: product.images,
        }}
      />
    </main>
  );
}
