import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { MetaMaskProvider } from "../libs";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <MetaMaskProvider>
        <Component {...pageProps} />
      </MetaMaskProvider>
    </ChakraProvider>
  );
}
export default MyApp;
