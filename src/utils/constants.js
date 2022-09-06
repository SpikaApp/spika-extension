import { version, dependencies } from "../../package.json";

// Extension version
export const EXTENSION_VERSION = version;
export const APTOS_SDK_VERSION = dependencies.aptos.slice(1);

// Nodes URL
export const NODE_URL = "https://fullnode.devnet.aptoslabs.com/v1";
export const FAUCET_URL = "https://faucet.devnet.aptoslabs.com";

// BIP32 Aptos derivative path
export const APTOS_DERIVE_PATH = "m/44'/637'/0'/0'/0'";

// Extension type
export const PLATFORM = window.location.protocol;
