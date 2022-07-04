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

const FaucetPage: NextPage<{ adminAddress: string, adminPrivate: string }> = ({ adminAddress, adminPrivate }) => {
    const { accounts, active, chainId, disconnect } = useMetaMask();
    const [to, setTo] = useState<string>("0xA296958dB61f69e7420b7f4fA841803E46536802")
    const [amount, setAmount] = useState<number>(11)

    const sendCoin = async () => {
        const web3 = new Web3(window.ethereum)
        const utils = web3.utils
        const contract = new web3.eth.Contract(abi, contractAddress)

        const [gasPrice, nonce] = await Promise.all([
            web3.eth.getGasPrice(),
            web3.eth.getTransactionCount(adminAddress, 'pending')
        ])

        const amountHex = new BigNumber(amount).times(`1e18`)

        const rawTransaction : any = {
            to: '0x0064164e643f4EfFDdd5E5892C7e4C707908D55f', // Required except during contract publications.
            from: accounts[0], // must match user's active address.
            gasPrice: utils.toHex(gasPrice),
            gasLimit: utils.toHex(150000),
            nonce: utils.toHex(nonce),
            value: '0x00', // Only required to send ether to the recipient from the initiating external account.
            data: contract.methods.transfer(to, amountHex).encodeABI()
        }

        const signedTransaction = await web3.eth.accounts.signTransaction(rawTransaction, adminPrivate);

        web3.eth
        .sendSignedTransaction(signedTransaction.rawTransaction as string)

        console.log("signedTransaction.transactionHash: ", signedTransaction.transactionHash)
        return signedTransaction.transactionHash
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

export default FaucetPage;

export async function getStaticProps() {
    return {
        props: {
            adminAddress: process.env.ADMIN_ADDRESS,
            adminPrivate: process.env.ADMIN_PRIVATE
        }
    }
}