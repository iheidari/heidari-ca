import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Github from "../components/logo/github";
import Tweeter from "../components/logo/Tweeter";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Iman Heidari personal website</title>
        <meta
          name="description"
          content="This is Iman Heidari's personal website"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Iman Heidari</h1>

        <div className={styles.avatar}>
          <Image
            src="https://avatars.githubusercontent.com/u/1315090?v=4"
            alt="iman heidari"
            width={100}
            height={100}
          />
        </div>

        <div className={styles.socials}>
          <a href="https://github.com/iheidari/">
            <Github />
          </a>
          <a href="https://twitter.com/ximaneshon/">
            <Tweeter />
          </a>
        </div>
      </main>
    </div>
  );
};

export default Home;
