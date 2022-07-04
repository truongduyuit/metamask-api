export interface AddEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
  chainName: string;
  nativeCurrency: {
    name?: string;
    symbol: string; // 2-6 characters long
    decimals?: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[]; // Currently ignored.
}

export interface SwitchEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
}

export interface WatchAssetParameter {
  type: "ERC20"; // In the future, other standards will be supported
  options: {
    address: string; // The address of the token contract
    symbol: string; // A ticker symbol or shorthand, up to 5 characters
    decimals: number; // The number of token decimals
    image: string; // A string url of the token logo
  };
}

export interface Web3WalletPermission {
  // The name of the method corresponding to the permission
  parentCapability: string;

  // The date the permission was granted, in UNIX epoch time
  date?: number;
}

export interface RequestedPermissions {
  [methodName: string]: {}; // an empty object, for future extensibility
}

export interface DecryptParameter {
  encryptedMessage: string;
}

export interface TransactionParameters {
  nonce?: string; // ignored by MetaMask
  gasPrice: string; // customizable by user during MetaMask confirmation.
  gas: string; // customizable by user during MetaMask confirmation.
  to: string; // Required except during contract publications.
  //   from: string; // must match user's active address.
  value: string; // Only required to send ether to the recipient from the initiating external account.
  data?: string; // Optional, but used for defining smart contract creation and interaction.
  //   chainId: string; // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
}
