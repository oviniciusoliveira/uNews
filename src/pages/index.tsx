import { GetServerSideProps } from "next";
import Head from "next/head";
import { SubscribeButton } from "../components/SubscribeButton";
import { stripe } from "../services/stripe";

import styles from "./home.module.scss";

type HomeProps = {
  product: {
    priceId: string;
    amount: number;
  };
};

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Início | u.news</title>
      </Head>

      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>
            News about the <span>React</span> world
          </h1>
          <p>
            Get access to all the publications <br />
            <span>for {product.amount} month</span>
          </p>
          <SubscribeButton priceId={product.priceId} />
        </section>
        {/* TODO: Change img element to next image element */}
        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const price = await stripe.prices.retrieve("price_1KF142J3DdVlGVY5KArfIqwy", {
    expand: ["product"],
  });

  const priceInDollars = price.unit_amount / 100;
  const priceFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceInDollars);

  const product = {
    priceId: price.id,
    amount: priceFormatted,
  };

  return {
    props: {
      product,
    },
  };
};
