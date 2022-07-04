import { Button, Container } from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import { useMetaMask } from "../libs/metamask";
import styles from "../styles/Home.module.css";
import { abi } from "../public/abi"
import { useState } from "react";
import Web3 from "web3"
import { BigNumber } from "bignumber.js"

const contractAddress = "0x0064164e643f4EfFDdd5E5892C7e4C707908D55f"

const Home: NextPage = () => {
  const { accounts, active, chainId, disconnect } = useMetaMask();
  const [to, setTo] = useState<string>("0xA296958dB61f69e7420b7f4fA841803E46536802")
  const [amount, setAmount] = useState<number>(10)

  const sendCoin = async () => {
    const web3 = new Web3(window.ethereum)
    const contract = new web3.eth.Contract(abi, contractAddress)

    const transactionParameters = {
      to: '0x0064164e643f4EfFDdd5E5892C7e4C707908D55f', // Required except during contract publications.
      from: accounts[0], // must match user's active address.
      value: '0x00', // Only required to send ether to the recipient from the initiating external account.
      data: contract.methods.transfer(to, new BigNumber(amount).times(`1e18`)).encodeABI()
    }

    // txHash is a hex string
    // As with any RPC call, it may throw an error
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });
    
    console.log("txHash: ", txHash)
    return txHash
  }

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

        <Button onClick={sendCoin}>Send coin</Button>
      </Container>
    </div>
  );
};

export default Home;
