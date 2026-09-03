import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadProductImage, StorageNotConfiguredError } from "@/lib/storage/cloudinary";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (session.role !== "VENDOR") {
    return NextResponse.json({ error: "Vendors only." }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Only image files are allowed." },
      { status: 400 },
    );
  }

  try {
    const url = await uploadProductImage(file);
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    throw error;
  }
}
