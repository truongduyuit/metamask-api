import { Button, Container } from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import { useMetaMask } from "../libs/metamask";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const { accounts, active, chainId, disconnect } = useMetaMask();

  return (
    <div className={styles.container}>
      <Head>
        <title>Metamask api</title>
        <meta name="description" content="truongduyuit study metamask api" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container mt={10}>
        <label>{chainId}</label>

        <Button id="mask_btn_connect" mx={10}>
          Connect MetaMask
        </Button>
        <Button onClick={disconnect}>
          {active ? accounts[0] : "Loading..."}
        </Button>
      </Container>
    </div>
  );
};

export default Home;
