import { _decorator, Component } from "cc";
const { ccclass } = _decorator;

import { ProgressHandler } from "./ProgressHandler";
import { MessageHandler } from "./MessageHandler";

@ccclass("HotUpdateInfoComp")
export default class HotUpdateInfoComp
  extends Component
  implements ProgressHandler, MessageHandler
{
  onProgress(progress: number): void {}
  onMessage(message: string): void {}
}
