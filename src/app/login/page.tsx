import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, roleHome } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(roleHome(session.role));

  return (
    <main style={{ padding: "2rem", maxWidth: "28rem", margin: "0 auto" }}>
      <h1>Log in</h1>
      <LoginForm />
      <p style={{ marginTop: "1.5rem" }}>
        New to Glow Hub? <Link href="/signup">Sign up</Link>
      </p>
    </main>
  );
}
