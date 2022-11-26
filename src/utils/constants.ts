import { dependencies, version } from "../../package.json";

// Extension version
export const EXTENSION_VERSION: string = version;
export const APTOS_SDK_VERSION: string = dependencies.aptos.slice(1);

// Node and Faucet URLs (default to Devnet)
export const NODE_URL = "https://fullnode.devnet.aptoslabs.com/v1";
export const FAUCET_URL = "https://faucet.devnet.aptoslabs.com";

// BIP44 Aptos derivative path
export const APTOS_DERIVE_PATH = "m/44'/637'/0'/0'/0'";

// Extension type
export const PLATFORM: string = window.location.protocol;

// Default Max Gas in Gas Units
export const DEFAULT_MAX_GAS: string = import.meta.env.VITE_SPIKA_DEFAULT_MAX_GAS;
