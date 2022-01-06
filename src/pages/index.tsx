import Head from "next/head";

import styles from "../styles/Home.module.scss";

export default function Home() {
  return (
    <>
      <Head>
        <title>Início | u.news</title>
      </Head>

      <div>
        <h1 className={styles.title}>
          Hello <span>Next</span>
        </h1>
      </div>
    </>
  );
}
