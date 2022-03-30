import { createContext, useContext, useEffect, useState } from "react";

declare global {
  interface Window {
    ethereum: any;
  }
}

export const MetaMaskContext = createContext({
  active: false,
  chainId: "",
  accounts: [],
  connect: () => {},
  disconnect: () => {},
});

export const MetaMaskProvider: React.FC = ({ children }) => {
  const [active, setactive] = useState<boolean>(false);
  const [chainId, setChainId] = useState<string>("");
  const [accounts, setAccounts] = useState<string[]>([]);
  const [connectBtn, setConnectBtn] = useState<HTMLElement | null>();

  useEffect(() => {
    setConnectBtn(document.getElementById("mask_btn_connect"));

    connectBtn?.addEventListener("click", () => {
      getAccount();
    });

    window.ethereum.on("connect", function (connectInfo: any) {
      setChainId(connectInfo.chainId);
    });

    window.ethereum.on("disconnect", function (accounts: string[]) {
      setAccounts([]);
      setactive(false);
    });

    window.ethereum.on("accountsChanged", function (accounts: string[]) {
      setAccounts(accounts);
    });

    return () => {
      connectBtn?.removeEventListener("click", () => {
        getAccount();
      });
    };
  }, [connectBtn]);

  async function getAccount() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccounts(accounts);
    setactive(true);
  }

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

  return (
    <MetaMaskContext.Provider
      value={{
        accounts: accounts as never[],
        active,
        chainId,
        connect,
        disconnect,
      }}
    >
      {children}
    </MetaMaskContext.Provider>
  );
};

export const useMetaMask = () => {
  return useContext(MetaMaskContext);
};
