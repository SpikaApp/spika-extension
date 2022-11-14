interface ICoin {
  type: string;
  data: ICoinData;
}

interface ICoinData {
  name: string;
  symbol: string;
  decimals: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logo: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logo_alt: any;
  swap: false;
  balance?: string;
}

export default ICoin;
