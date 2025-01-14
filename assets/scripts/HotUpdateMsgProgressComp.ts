import { _decorator, Component } from "cc";
const { ccclass } = _decorator;

export interface Progress {
  fileProgress: number;
  byteProgress: number;
  downloadedFiles: number;
  downloadedBytes: number;
  totalFiles: number;
  totalBytes: number;
}

@ccclass("HotUpdateMsgProgressComp")
export default class HotUpdateMsgProgressComp extends Component {
  onMessage(message: string): void {}
  onProgress(progress: Progress): void {}
}
