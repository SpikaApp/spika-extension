type INotificationType = "success" | "info" | "warning" | "error";
type ISpikaNewsType = "wallet_news" | "pending_claims";

interface INotification {
  message: string;
  title?: string;
  type?: INotificationType;
  autoHide?: boolean;
  untilExpired?: boolean;
}

export interface ISpikaNews {
  title: string;
  message: string;
  type: ISpikaNewsType;
  read: boolean;
}

export default INotification;
