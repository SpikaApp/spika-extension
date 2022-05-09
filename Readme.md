# Spika Wallet for Aptos Blockchain

### Description

Wallet was created during early stages of Aptos blockchain development and serves as an extension to [simple-cli-wallet](https://github.com/xorgal/simple-cli-wallet). It supports TestCoin transfer to other addresses and history of previous transactions. Account can be created with newly generated mnemonic phrase or by importing own mnemonic phrase in compliance with BIP39 standard. New account will start with 0 balance, however, it's possible to fund address by requesting TestCoin from Faucet. Mint function enables this. After address was successfully created account's mnemonic phrase and private key will be saved in browser's localStorage for next session. All sensitive data stored in browser are encrypted in AES-GCM mode using browser-passworder module. User's password serves as a key to unlock this data. Both mnemonic phrase and private key can be exported from localStorage at any time. "About" tab provides this information. Wallet doesn't save anything on it's own disk, all data saved in user's browser or in wallet's memory. Wallet's functional part is driven by Aptos SDK. Aptos Account is assembled in wallet's memory on each new browser's session based on mnemonic phrase provided either during generation of new account or during import of existing account.

### Installation

Latest release available as Chrome extension

### License

MIT
