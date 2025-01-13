import { _decorator } from "cc";
import HotUpdateInfoComp from "./HotUpdateInfoComp";
const { ccclass } = _decorator;

@ccclass("SampleComp")
export default class SampleComp extends HotUpdateInfoComp {
  onProgress(progress: number): void {}
  onMessage(message: string): void {}
}
