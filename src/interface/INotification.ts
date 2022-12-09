type INotificationType = "success" | "info" | "warning" | "error";

interface INotification {
  message: string;
  title?: string;
  type?: INotificationType;
  autoHide?: boolean;
  untilExpired?: boolean;
}

export default INotification;
