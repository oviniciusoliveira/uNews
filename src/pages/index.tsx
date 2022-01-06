import styles from "../styles/Home.module.scss";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>u.news</title>
      </Head>

      <div>
        <h1 className={styles.title}>
          Hello <span>Next</span>
        </h1>
      </div>
    </>
  );
}
