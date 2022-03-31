import sigUtil from "@metamask/eth-sig-util";
import ethUtil from "ethereumjs-util";
import { createContext, useContext, useEffect, useState } from "react";
import {
  AddEthereumChainParameter,
  DecryptParameter,
  RequestedPermissions,
  SwitchEthereumChainParameter,
  TransactionParameters,
  WatchAssetParameter,
  Web3WalletPermission,
} from ".";

declare global {
  interface Window {
    ethereum: any;
  }
}

interface IMetaMaskContext {
  isMetaMaskInstalled: boolean;
  active: boolean;
  chainId: string;
  accounts: string[];
  connect: () => void;
  disconnect: () => void;
  switchChain: (chain: SwitchEthereumChainParameter) => void;
  addChain: (chain: AddEthereumChainParameter) => void;
  watchAsset: (asset: WatchAssetParameter) => Promise<boolean>;
  scanQRCode: (params: string[]) => void;
  getPermissions: () => Promise<Web3WalletPermission[]>;
  requestPermissions: (
    permissions: RequestedPermissions
  ) => Promise<Web3WalletPermission[]>;
  decrypt: ({ encryptedMessage }: DecryptParameter) => Promise<string>;
  getEncryptionPublicKey: () => Promise<string>;
  encrypt: (encryptionPublicKey: string) => string;
  sendTransaction: (params: TransactionParameters) => Promise<string>;
}

const MetaMaskContextDefault: IMetaMaskContext = {
  isMetaMaskInstalled: false,
  active: false,
  chainId: "",
  accounts: [],
  connect: () => {},
  disconnect: () => {},
  switchChain: () => {},
  addChain: () => {},
  watchAsset: () => Promise.resolve(false),
  scanQRCode: () => {},
  getPermissions: () => Promise.resolve([]),
  requestPermissions: () => Promise.resolve([]),
  decrypt: () => Promise.resolve(""),
  getEncryptionPublicKey: () => Promise.resolve(""),
  encrypt: () => "",
  sendTransaction: () => Promise.resolve(""),
};

export const MetaMaskContext = createContext<IMetaMaskContext>(
  MetaMaskContextDefault
);

interface Props {}

export const MetaMaskProvider: React.FC<Props> = ({ children }) => {
  const [active, setactive] = useState<boolean>(false);
  const [chainId, setChainId] = useState<string>("");
  const [accounts, setAccounts] = useState<string[]>([]);
  const [connectBtn, setConnectBtn] = useState<HTMLElement | null>();
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] =
    useState<boolean>(false);

  useEffect(() => {
    setConnectBtn(document.getElementById("mask_btn_connect"));

    connectBtn?.addEventListener("click", () => {
      connect();
    });

    window.ethereum.on("connect", (connectInfo: any) => {
      setChainId(connectInfo.chainId);
    });

    window.ethereum.on("disconnect", () => {
      setAccounts([]);
      setactive(false);
    });

    window.ethereum.on("accountsChanged", (accounts: string[]) => {
      setAccounts(accounts);
    });

    setIsMetaMaskInstalled(checkMetaMaskInstalled());
    return () => {
      connectBtn?.removeEventListener("click", () => {
        connect();
      });
    };
  }, [connectBtn]);

  const checkMetaMaskInstalled = () => {
    //Have to check the ethereum binding on the window object to see if it's installed
    const { ethereum } = window;
    return Boolean(ethereum && ethereum.isMetaMask);
  };

  //#region eth
  const connect = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setactive(true);
    setAccounts(accounts);
  };

  const disconnect = () => {
    setactive(false);
    setAccounts([]);
  };

  /**
   *
   * @param param0 encryptedMessage: The address of the Ethereum account whose encryption key should be retrieved
   * @returns The public encryption key of the specified Ethereum account.
   */
  const decrypt = async ({
    encryptedMessage,
  }: DecryptParameter): Promise<string> =>
    await window.ethereum.request({
      method: "eth_decrypt",
      params: [encryptedMessage, accounts[0]],
    });

  /**
   *
   * @returns The address of the Ethereum account whose encryption key should be retrieved
   */
  const getEncryptionPublicKey = async (): Promise<string> =>
    await window.ethereum.request({
      method: "eth_getEncryptionPublicKey",
      params: [accounts[0]], // you must have access to the specified account
    });

  /**
   *
   * @param encryptionPublicKey The address of the Ethereum account whose encryption key should be retrieved
   * @returns  encryption key
   */
  const encrypt = (encryptionPublicKey: string): string =>
    ethUtil.bufferToHex(
      Buffer.from(
        JSON.stringify(
          sigUtil.encrypt({
            publicKey: encryptionPublicKey,
            data: "hello world!",
            version: "x25519-xsalsa20-poly1305",
          })
        ),
        "utf8"
      )
    );

  const sendTransaction = async (
    params: TransactionParameters
  ): Promise<string> =>
    await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          ...params,
          from: accounts[0],
          chainId,
        },
      ],
    });
  //#endregion

  //#region wallet

  /**
   *
   * @param chain Metadata about the chain that will be added to MetaMask.
   * @returns null if the request was successful, and an error otherwise.
   */
  const addChain = async (chain: AddEthereumChainParameter) =>
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [chain],
    });

  /**
   *
   * @param param0 Metadata about the chain that MetaMask will switch to.
   * @returns null if the request was successful, and an error otherwise.
   */
  const switchChain = async ({ chainId }: SwitchEthereumChainParameter) =>
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });

  /**
   *
   * @param asset The metadata of the asset to watch.
   * @returns true if the the token was added, false otherwise.
   */
  const watchAsset = async (asset: WatchAssetParameter): Promise<boolean> =>
    await window.ethereum.request({
      method: "wallet_watchAsset",
      params: { ...asset },
    });

  /**
   *
   * @returns An array of the caller's permissions.
   */
  const getPermissions = async (): Promise<Web3WalletPermission[]> =>
    await window.ethereum.request({ method: "eth_requestAccounts" });

  /**
   *
   * @param permissions The requested permissions.
   * @returns An array of the caller's permissions.
   */
  const requestPermissions = async (
    permissions: RequestedPermissions
  ): Promise<Web3WalletPermission[]> =>
    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ ...permissions }],
    });
  //#endregion

  //#region mobile specific RPC methods

  /**
   *
   * @param params (optional) A regular expression for matching arbitrary QR code strings
   * @returns The string corresponding to the scanned QR code.
   */
  const scanQRCode = async (params: string[]) =>
    await window.ethereum.request({
      method: "wallet_scanQRCode",
      // The regex string must be valid input to the RegExp constructor, if provided
      params,
    });
  //#endregion

  return (
    <MetaMaskContext.Provider
      value={{
        isMetaMaskInstalled,
        accounts,
        active,
        chainId,
        connect,
        disconnect,
        switchChain,
        addChain,
        watchAsset,
        scanQRCode,
        getPermissions,
        requestPermissions,
        decrypt,
        getEncryptionPublicKey,
        encrypt,
        sendTransaction,
      }}
    >
      {children}
    </MetaMaskContext.Provider>
  );
};

export const useMetaMask = () => {
  return useContext(MetaMaskContext);
};
