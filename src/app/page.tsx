import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Glow Hub</h1>
        <p>
          Marketplace skeleton is up. Business logic lands in later phases —
          see <code>docs/build-plan.md</code>.
        </p>
      </main>
    </div>
  );
}
