export const hippoFaucet = {
  type: "entry_function_payload",
  function: "0x498d8926f16eb9ca90cab1b3a26aa6f97a080b3fcbe6e83ae150b7243a00fb68::devnet_coins::mint_to_wallet",
  type_arguments: ["0x498d8926f16eb9ca90cab1b3a26aa6f97a080b3fcbe6e83ae150b7243a00fb68::devnet_coins::DevnetDAI"],
  arguments: ["1000000000"],
};

export const hippoSwap = {
  type: "entry_function_payload",
  function: "0xa61e1e86e9f596e483283727d2739ba24b919012720648c29380f9cd0a96c11a::aggregatorv6::two_step_route",
  type_arguments: [
    "0x498d8926f16eb9ca90cab1b3a26aa6f97a080b3fcbe6e83ae150b7243a00fb68::devnet_coins::DevnetUSDT",
    "0x498d8926f16eb9ca90cab1b3a26aa6f97a080b3fcbe6e83ae150b7243a00fb68::devnet_coins::DevnetUSDC",
    "0x498d8926f16eb9ca90cab1b3a26aa6f97a080b3fcbe6e83ae150b7243a00fb68::devnet_coins::DevnetBTC",
    "u8",
    "0xb1d4c0de8bc24468608637dfdbff975a0888f8935aa63338a44078eec5c7b6c7::registry::E0",
  ],
  arguments: [1, 3, true, 2, 1, false, "100000000", "9900"],
};
