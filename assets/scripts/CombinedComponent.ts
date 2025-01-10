import { _decorator, Component } from "cc";
import { ProgressHandler } from "./ProgressHandler";
import { MessageHandler } from "./MessageHandler";
const { ccclass } = _decorator;

@ccclass
export default class CombinedComponent
  extends Component
  implements ProgressHandler, MessageHandler
{
  onProgress(progress: number): void {
    console.log(`Progress: ${progress * 100}%`);
    // 更新进度条等逻辑
  }

  onMessage(message: string): void {
    console.log(`Message: ${message}`);
    // 处理消息的逻辑
  }
}
