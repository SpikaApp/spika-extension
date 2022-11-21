export interface IRequest {
  method: IRequestMethod;
  id: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: any;
}

type IRequestMethod =
  | "connect"
  | "isConnected"
  | "account"
  | "signMessage"
  | "signTransaction"
  | "signAndSubmitTransaction";
