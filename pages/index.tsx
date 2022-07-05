import { Box, Button, Container, Flex, FormControl, FormLabel, Heading, Input, Stack, Text, useToast } from "@chakra-ui/react";
import { BigNumber } from "bignumber.js";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Web3 from "web3";
import { useMetaMask } from "../libs/metamask";
import { abi } from "../public/abi";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const toast = useToast()
  const router = useRouter();
  const { accounts, active, disconnect, connect } = useMetaMask();

  const [to, setTo] = useState<string>("")
  const [amount, setAmount] = useState<number>(10)
  const [contractAddress, setContractAddress] = useState<string>("")
  const [decimals, setDecimals] = useState<number>(18)

  const sendCoin = async () => {
    if (contractAddress === "" || to === "") {
      toast({
        title: "Send coin error",
        description: "contract address or receiver's address is empty",
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: "bottom-right"
      })
      return
    }

    if (!accounts[0] || accounts[0] === "") {
      toast({
        title: "Send coin error",
        description: "must connect metamask",
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: "bottom-right"
      })
      return
    }

    try {
      const web3 = new Web3(window.ethereum)
      const contract = new web3.eth.Contract(abi, contractAddress)

      const transactionParameters = {
        to: contractAddress,
        from: accounts[0],
        value: '0x00',
        data: contract.methods.transfer(to, new BigNumber(amount).times(`1e${decimals}`)).encodeABI()
      }

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      toast({
        title: 'Send coin success',
        description: `Check it at: https://ropsten.etherscan.io/tx/${txHash}`,
        status: 'success',
        duration: 9000,
        isClosable: true,
        position: "bottom-right"
      })

      console.log(`https://ropsten.etherscan.io/tx/${txHash}`)
    } catch (error) {
      const { message } = error as any
      toast({
        title: "Send coin error",
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: "bottom-right"
      })
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Metamask api</title>
        <meta name="description" content="truongduyuit study metamask api" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container>
        <Flex alignItems={'center'} justifyContent='right' mt={5}>
          {
            active ? <></> : <Button id="mask_btn_connect" onClick={connect} bg={'blue.400'} color={'white'}>
              Connect MetaMask
            </Button>
          }
          {
            active ? <Button onClick={disconnect} bg={'blue.400'} color={'white'}>
              {accounts[0].slice(0, 7)} ... {accounts[0].slice(-7)}
            </Button> : <></>
          }
        </Flex>

        <Flex
          minH={'100vh'}
          align={'center'}
          justify={'center'}
          bg='gray.50'
        >
          <Stack
            spacing={4}
            w={'full'}
            maxW='xl'
            bg='white'
            rounded={'xl'}
            boxShadow={'lg'}
            p={6}
            my={12}
            border='2px solid #ccc'>
            <Heading lineHeight={1.1} fontSize={{ base: '2xl', md: '3xl' }}>
              Metamask Send ERC20
            </Heading>
            <Text
              fontSize={{ base: 'sm', sm: 'md' }}
              color='gray.800'>
              Get <b> DAI </b> tokens: <Link href={router.pathname + "faucet"} passHref><Box as="a" color="teal" fontSize="1.4rem" fontWeight="bold" textDecoration="underline">Go to faucet page</Box></Link>
            </Text>
            <FormControl isRequired>
              <FormLabel htmlFor='contract_address'>Contract address: </FormLabel>
              <Input
                id="contract_address"
                placeholder="Enter contract address"
                _placeholder={{ color: 'gray.500' }}
                value={contractAddress}
                onChange={e => setContractAddress(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel htmlFor='decimal'>Decimals: </FormLabel>
              <Input
                id="decimal"
                placeholder="Enter contract decimals"
                _placeholder={{ color: 'gray.500' }}
                type="number"
                value={decimals}
                onChange={e => setDecimals(+e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel htmlFor='receiver_address'>Receiver's Address: </FormLabel>
              <Input
                id="receiver_address"
                placeholder="Enter receiving address"
                _placeholder={{ color: 'gray.500' }}
                value={to}
                onChange={e => setTo(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel htmlFor='amount'>Amount: </FormLabel>
              <Input
                id="receiver_address"
                placeholder="Enter receiving address"
                _placeholder={{ color: 'gray.500' }}
                value={amount}
                type="number"
                onChange={e => setAmount(+e.target.value)}
              />
            </FormControl>
            <Stack spacing={6}>
              <Button
                bgColor='teal'
                color={'white'}
                _hover={{
                  bg: 'blue.500',
                }}
                onClick={sendCoin}
              >
                Send
              </Button>
            </Stack>
          </Stack>
        </Flex>
      </Container>
    </div>
  );
};

export default Home;
