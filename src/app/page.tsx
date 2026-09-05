import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Glow Hub</h1>
        <p>
          Nigeria-based marketplace for beauty, fashion, and accessories.
          Checkout lands in later phases — see <code>docs/build-plan.md</code>.
        </p>
        <p>
          <Link href="/shop">Browse the shop</Link>
        </p>
        <p>
          <Link href="/login">Log in</Link> · <Link href="/signup">Sign up</Link>
        </p>
      </main>
    </div>
  );
}
