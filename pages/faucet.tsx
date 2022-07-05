import { Box, Button, Container, Flex, FormControl, FormLabel, Heading, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Spinner, Stack, Text, useToast } from "@chakra-ui/react";
import { BigNumber } from "bignumber.js";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Web3 from "web3";
import { abi } from "../public/abi";
import styles from "../styles/Home.module.css";

const contractAddress = "0x0064164e643f4EfFDdd5E5892C7e4C707908D55f"
const decimals = 18

const FaucetPage: NextPage<{ adminAddress: string, adminPrivate: string }> = ({ adminAddress, adminPrivate }) => {
	const toast = useToast()
	const router = useRouter();

	const [isSending, setIsSending] = useState<boolean>(false)
	const [to, setTo] = useState<string>("")
	const [amount, setAmount] = useState<number>(10)

	const sendCoin = async () => {
		if (to === "") {
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
		setIsSending(true)

		try {
			const web3 = new Web3(window.ethereum)
			const contract = new web3.eth.Contract(abi, contractAddress)

			const [nonce, gasPrice] = await Promise.all([web3.eth.getTransactionCount(adminAddress, 'pending'), web3.eth.getGasPrice()])

			const rawTransaction = {
				nonce, gasPrice, gasLimit: 150000,
				to: adminAddress,
				from: adminAddress,
				value: '0x00',
				data: contract.methods.transfer(to, new BigNumber(amount).times(`1e${decimals}`).toString()).encodeABI(),
			}

			const signedTransaction = await web3.eth.accounts.signTransaction(rawTransaction, adminPrivate)

			console.log(`https://ropsten.etherscan.io/tx/${signedTransaction.transactionHash}`)
			toast({
				title: 'Send coin success',
				description: `Check it at: https://ropsten.etherscan.io/tx/${signedTransaction.transactionHash}`,
				status: 'success',
				duration: 9000,
				isClosable: true,
				position: "bottom-right"
			})

			web3.eth.sendSignedTransaction(signedTransaction.rawTransaction as string)
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

		setIsSending(false)
	}

	return (
		<div className={styles.container}>
			<Head>
				<title>Metamask api</title>
				<meta name="description" content="truongduyuit study metamask api" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Container>
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
						border='2px solid #ccc'
						position="relative"

					>
						{isSending ? <Box position="absolute" bgColor="#ccc" top={0} left={0} right={0} bottom={0} zIndex={999} opacity={0.5}>
							<Flex justify="center" align="center" h="full"><Spinner /></Flex>
						</Box> : <></>}

						<Heading lineHeight={1.1} fontSize={{ base: '2xl', md: '3xl' }}>
							DAI Ropsten Faucet
						</Heading>
						<Text
							fontSize={{ base: 'sm', sm: 'md' }}
							color='gray.800'>
							Back to transfer <b> DAI </b> tokens: <Link href={"/"} passHref><Box as="a" color="teal" fontSize="1.4rem" fontWeight="bold" textDecoration="underline">Back to home</Box></Link>
						</Text>
						<FormControl isRequired>
							<FormLabel>Contract address: </FormLabel>
							<Input
								_placeholder={{ color: 'gray.500' }}
								value={contractAddress}
								disabled={true}
							/>
						</FormControl>

						<FormControl isRequired>
							<FormLabel>Decimals: </FormLabel>
							<Input
								_placeholder={{ color: 'gray.500' }}
								type="number"
								value={decimals}
								disabled={true}
							/>
						</FormControl>

						<FormControl isRequired>
							<FormLabel htmlFor='receiver_address'>Your ETH Address: </FormLabel>
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
							<NumberInput defaultValue={amount} min={1} max={15}>
								<NumberInputField id="amount"
									placeholder="Enter amount"
									_placeholder={{ color: 'gray.500' }}
									value={amount}
									onChange={e => setAmount(+e.target.value)} />
								<NumberInputStepper>
									<NumberIncrementStepper />
									<NumberDecrementStepper />
								</NumberInputStepper>
							</NumberInput>
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
		</div >
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