// MessageHandler 接口：定义消息处理方法
export interface MessageHandler {
  onMessage(message: string): void;
}
