import { _decorator } from "cc";
import HotUpdateMsgProgressComp, { Progress } from "./HotUpdateMsgProgressComp";

const { ccclass } = _decorator;

@ccclass("SampleComp")
export default class SampleComp extends HotUpdateMsgProgressComp {
  onMessage(message: string): void {}
  onProgress(progress: Progress): void {}
}
