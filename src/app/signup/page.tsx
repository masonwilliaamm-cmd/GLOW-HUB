import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, roleHome } from "@/lib/auth";
import { SignupForm } from "@/components/auth/SignupForm";

export default async function SignupPage() {
  const session = await getSession();
  if (session) redirect(roleHome(session.role));

  return (
    <main style={{ padding: "2rem", maxWidth: "28rem", margin: "0 auto" }}>
      <h1>Sign up</h1>
      <SignupForm />
      <p style={{ marginTop: "1.5rem" }}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </main>
  );
}
