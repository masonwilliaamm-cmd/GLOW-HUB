import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Glow Hub</h1>
        <p>
          Marketplace skeleton is up. Storefront and checkout land in later
          phases — see <code>docs/build-plan.md</code>.
        </p>
        <p>
          <Link href="/login">Log in</Link> · <Link href="/signup">Sign up</Link>
        </p>
      </main>
    </div>
  );
}
