import { ICoin } from "../interface";
import aptos_light from "../assets/aptos_light.png";
import aptos_dark from "../assets/aptos_dark.png";

export const aptosCoin: ICoin = {
  type: "0x1::aptos_coin::AptosCoin",
  data: {
    name: "Aptos Coin",
    symbol: "APT",
    decimals: 8,
    logo: aptos_light,
    logo_alt: aptos_dark,
    swap: false,
  },
};

export const coinList: Array<ICoin> = [
  {
    type: "0x1::aptos_coin::AptosCoin",
    data: {
      name: "Aptos Coin",
      symbol: "APT",
      decimals: 8,
      logo: aptos_light,
      logo_alt: aptos_dark,
      swap: true,
    },
  },
  {
    type: "0x84edd115c901709ef28f3cb66a82264ba91bfd24789500b6fd34ab9e8888e272::coin::DLC",
    data: {
      name: "Doglaika Coin",
      symbol: "DLC",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/a399b193a4c5288ffbb7c59e28bfcefc662ce8d4/icons/doglaika.png",
      logo_alt:
        "https://raw.githubusercontent.com/hippospace/aptos-coin-list/a399b193a4c5288ffbb7c59e28bfcefc662ce8d4/icons/doglaika.png",
      swap: true,
    },
  },
  {
    type: "0xe9c192ff55cffab3963c695cff6dbf9dad6aff2bb5ac19a6415cad26a81860d9::mee_coin::MeeCoin",
    data: {
      name: "Meeiro",
      symbol: "MEE",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/MEE.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/MEE.svg",
      swap: true,
    },
  },
  {
    type: "0xe9c192ff55cffab3963c695cff6dbf9dad6aff2bb5ac19a6415cad26a81860d9::mee_coin::MeeCoin",
    data: {
      name: "AnimeSwap Coin",
      symbol: "ANI",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/ANI.png",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/ANI.png",
      swap: true,
    },
  },
  {
    type: "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::reserve::LP<0x1::aptos_coin::AptosCoin>",
    data: {
      name: "Aries Aptos Coin LP Token",
      symbol: "ar-APT",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/ar-APT.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/ar-APT.svg",
      swap: true,
    },
  },
  {
    type: "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::reserve::LP<0xdd89c0e695df0692205912fb69fc290418bed0dbe6e4573d744a6d5e6bab6c13::coin::T>",
    data: {
      name: "Aries Solana (Wormhole) LP Token",
      symbol: "ar-APT",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/ar-SOL.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/ar-SOL.svg",
      swap: true,
    },
  },
  {
    type: "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::reserve::LP<0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC>",
    data: {
      name: "Aries USDC (Layerzero) LP Token",
      symbol: "ar-zUSDC",
      decimals: 6,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/ar-USDC.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/ar-USDC.svg",
      swap: true,
    },
  },
  {
    type: "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::reserve::LP<0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T>",
    data: {
      name: "Aries USDC (Wormhole) LP Token",
      symbol: "ar-USDC",
      decimals: 6,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/ar-USDC.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/ar-USDC.svg",
      swap: true,
    },
  },
  {
    type: "0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::UsdcCoin",
    data: {
      name: "USD Coin (Celer)",
      symbol: "ceUSDC",
      decimals: 6,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg",
      swap: true,
    },
  },
  {
    type: "0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::UsdtCoin",
    data: {
      name: "Tether USD (Celer)",
      symbol: "ceUSDT",
      decimals: 6,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDT.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDT.svg",
      swap: true,
    },
  },
  {
    type: "0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::DaiCoin",
    data: {
      name: "Dai Stablecoin (Celer)",
      symbol: "ceDAI",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/DAI.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/DAI.svg",
      swap: true,
    },
  },
  {
    type: "0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::WbtcCoin",
    data: {
      name: "Wrapped BTC (Celer)",
      symbol: "ceWBTC",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/WBTC.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/WBTC.svg",
      swap: true,
    },
  },
  {
    type: "0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::WethCoin",
    data: {
      name: "Wrapped Ether (Celer)",
      symbol: "ceWETH",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/WETH.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/WETH.svg",
      swap: true,
    },
  },
  {
    type: "0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::BnbCoin",
    data: {
      name: "Binance Coin (Celer)",
      symbol: "ceBNB",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/BNB.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/BNB.svg",
      swap: true,
    },
  },
  {
    type: "0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::BusdCoin",
    data: {
      name: "Binance USD (Celer)",
      symbol: "ceBUSD",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/BUSD.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/BUSD.svg",
      swap: true,
    },
  },
  {
    type: "0x5c738a5dfa343bee927c39ebe85b0ceb95fdb5ee5b323c95559614f5a77c47cf::Aptoge::Aptoge",
    data: {
      name: "Aptoge",
      symbol: "APTOGE",
      decimals: 6,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/APTOGE.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/APTOGE.svg",
      swap: true,
    },
  },
  {
    type: "0x881ac202b1f1e6ad4efcff7a1d0579411533f2502417a19211cfc49751ddb5f4::coin::MOJO",
    data: {
      name: "Mojito",
      symbol: "MOJO",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/MOJO.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/MOJO.svg",
      swap: true,
    },
  },
  {
    type: "0x84d7aeef42d38a5ffc3ccef853e1b82e4958659d16a7de736a29c55fbbeb0114::staked_aptos_coin::StakedAptosCoin",
    data: {
      name: "Tortuga Staked Aptos",
      symbol: "tAPT",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/TortugaStakedAptos.png",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/TortugaStakedAptos.png",
      swap: true,
    },
  },
  {
    type: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::WETH",
    data: {
      name: "Wrapped Ether (LayerZero)",
      symbol: "zWETH",
      decimals: 6,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/WETH.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/WETH.svg",
      swap: true,
    },
  },
  {
    type: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT",
    data: {
      name: "USD Tether (LayerZero)",
      symbol: "zUSDT",
      decimals: 6,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDT.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDT.svg",
      swap: true,
    },
  },
  {
    type: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC",
    data: {
      name: "USD Coin (LayerZero)",
      symbol: "zUSDC",
      decimals: 6,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg",
      swap: true,
    },
  },
  {
    type: "0x1000000fa32d122c18a6a31c009ce5e71674f22d06a581bb0a15575e6addadcc::usda::USDA",
    data: {
      name: "Argo USD",
      symbol: "USDA",
      decimals: 6,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDA.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDA.svg",
      swap: true,
    },
  },
  {
    type: "0xd11107bdf0d6d7040c6c0bfbdecb6545191fdf13e8d8d259952f53e1713f61b5::staked_coin::StakedAptos",
    data: {
      name: "Ditto Staked Aptos",
      symbol: "stAPT",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/DittoStakedAptos.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/DittoStakedAptos.svg",
      swap: true,
    },
  },
  {
    type: "0xc7160b1c2415d19a88add188ec726e62aab0045f0aed798106a2ef2994a9101e::coin::T",
    data: {
      name: "USD Coin (Wormhole Polygon)",
      symbol: "USDCpo",
      decimals: 6,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg",
      swap: true,
    },
  },
  {
    type: "0x407a220699982ebb514568d007938d2447d33667e4418372ffec1ddb24491b6c::coin::T",
    data: {
      name: "Dai Stablecoin (Wormhole)",
      symbol: "DAI",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/DAI.webp",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/DAI.webp",
      swap: true,
    },
  },
  {
    type: "0x39d84c2af3b0c9895b45d4da098049e382c451ba63bec0ce0396ff7af4bb5dff::coin::T",
    data: {
      name: "USD Coin (Wormhole Avalanche)",
      symbol: "USDCav",
      decimals: 6,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg",
      swap: true,
    },
  },
  {
    type: "0xacd014e8bdf395fa8497b6d585b164547a9d45269377bdf67c96c541b7fec9ed::coin::T",
    data: {
      name: "Tether USD",
      symbol: "USDTbs",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDT.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDT.svg",
      swap: true,
    },
  },
  {
    type: "0x79a6ed7a0607fdad2d18d67d1a0e552d4b09ebce5951f1e5c851732c02437595::coin::T",
    data: {
      name: "USD Coin (Wormhole, BSC)",
      symbol: "USDCbs",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg",
      swap: true,
    },
  },
  {
    type: "0xccc9620d38c4f3991fa68a03ad98ef3735f18d04717cb75d7a1300dd8a7eed75::coin::T",
    data: {
      name: "BUSD Token (Wormhole)",
      symbol: "BUSD",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/BUSD.webp",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/BUSD.webp",
      swap: true,
    },
  },
  {
    type: "0xae478ff7d83ed072dbc5e264250e67ef58f57c99d89b447efd8a0a2e8b2be76e::coin::T",
    data: {
      name: "Wrapped BTC (Wormhole)",
      symbol: "WBTC",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/BTC.webp",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/BTC.webp",
      swap: true,
    },
  },
  {
    type: "0x2305dd96edd8debb5a2049be54379c74e61b37ceb54a49bd7dee4726d2a6b689::coin::T",
    data: {
      name: "SushiToken (Wormhole)",
      symbol: "SUSHI",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/SUSHI.webp",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/SUSHI.webp",
      swap: true,
    },
  },
  {
    type: "0xac0c3c35d50f6ef00e3b4db6998732fe9ed6331384925fe8ec95fcd7745a9112::coin::T",
    data: {
      name: "Celo (Wormhole)",
      symbol: "CELO",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/CELO.webp",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/CELO.webp",
      swap: true,
    },
  },
  {
    type: "0x5b1bbc25524d41b17a95dac402cf2f584f56400bf5cc06b53c36b331b1ec6e8f::coin::T",
    data: {
      name: "Wrapped AVAX (Wormhole)",
      symbol: "WAVAX",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/AVAX.webp",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/AVAX.webp",
      swap: true,
    },
  },
  {
    type: "0x394205c024d8e932832deef4cbfc7d3bb17ff2e9dc184fa9609405c2836b94aa::coin::T",
    data: {
      name: "NEAR (Wormhole)",
      symbol: "NEAR",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/NEAR.webp",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/NEAR.webp",
      swap: true,
    },
  },
  {
    type: "0x6312bc0a484bc4e37013befc9949df2d7c8a78e01c6fe14a34018449d136ba86::coin::T",
    data: {
      name: "Wrapped BNB (Wormhole)",
      symbol: "WBNB",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/BNB.webp",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/BNB.webp",
      swap: true,
    },
  },
  {
    type: "0xcefd39b563951a9ec2670aa57086f9adb3493671368ea60ff99e0bc98f697bb5::coin::T",
    data: {
      name: "Chain",
      symbol: "XCN",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/XCN.webp",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/XCN.webp",
      swap: true,
    },
  },
  {
    type: "0x1f9dca8eb42832b9ea07a804d745ef08833051e0c75c45b82665ef6f6e7fac32::coin::T",
    data: {
      name: "Nexum Coin",
      symbol: "NEXM",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/NEXM.webp",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/NEXM.webp",
      swap: true,
    },
  },
  {
    type: "0x419d16ebaeda8dc374b1178a61d24fb699799d55a3f475f427998769c537b51b::coin::T",
    data: {
      name: "FTX Token",
      symbol: "FTT",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/FTXToken.webp",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/FTXToken.webp",
      swap: true,
    },
  },
  {
    type: "0xc91d826e29a3183eb3b6f6aa3a722089fdffb8e9642b94c5fcd4c48d035c0080::coin::T",
    data: {
      name: "USD Coin (Wormhole Solana)",
      symbol: "USDCso",
      decimals: 6,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg",
      swap: true,
    },
  },
  {
    type: "0xcc8a89c8dce9693d354449f1f73e60e14e347417854f029db5bc8e7454008abb::coin::T",
    data: {
      name: "Wrapped Ether (Wormhole)",
      symbol: "WETH",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/WETH.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/WETH.svg",
      swap: true,
    },
  },
  {
    type: "0xdd89c0e695df0692205912fb69fc290418bed0dbe6e4573d744a6d5e6bab6c13::coin::T",
    data: {
      name: "SOL (Wormhole)",
      symbol: "SOL",
      decimals: 8,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/SOL.webp",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/SOL.webp",
      swap: true,
    },
  },
  {
    type: "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T",
    data: {
      name: "USD Coin (Wormhole)",
      symbol: "USDC",
      decimals: 6,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDC.svg",
      swap: true,
    },
  },
  {
    type: "0xa2eda21a58856fda86451436513b867c97eecb4ba099da5775520e0f7492e852::coin::T",
    data: {
      name: "Tether USD (Wormhole)",
      symbol: "USDT",
      decimals: 6,
      logo: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDT.svg",
      logo_alt: "https://raw.githubusercontent.com/hippospace/aptos-coin-list/main/icons/USDT.svg",
      swap: true,
    },
  },
];

export const coinStore = (type: string): string => {
  return `0x1::coin::CoinStore<${type}>`;
};

export const coinInfo = (type: string): string => {
  return `0x1::coin::CoinInfo<${type}>`;
};
