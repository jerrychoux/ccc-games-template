import { _decorator, Button, find, Label, ProgressBar } from "cc";
import HotUpdateMsgProgressComp, { Progress } from "./HotUpdateMsgProgressComp";
import HotUpdateComp from "./HotUpdateComp";

const { ccclass, property } = _decorator;

@ccclass("SampleComp")
export default class SampleComp extends HotUpdateMsgProgressComp {
  @property(HotUpdateComp)
  hotUpdateComp: HotUpdateComp = null;

  private checkButton: Button;
  private updateButton: Button;
  private messageLabel: Label;
  private progressBar: ProgressBar;

  protected onLoad(): void {
    this.checkButton = this.node.getChildByName("Button").getComponent(Button);
    this.updateButton = this.node
      .getChildByName("Button-001")
      .getComponent(Button);
    this.messageLabel = find("Label", this.node).getComponent(Label);
    this.progressBar = find("ProgressBar", this.node).getComponent(ProgressBar);

    this.checkButton.node.on("click", this.onCheckButtonClick, this);
    this.updateButton.node.on("click", this.onUpdateButtonClick, this);

    this.messageLabel.string = "hello world";
    this.progressBar.progress = 0.99;
  }

  protected onDestroy(): void {
    this.checkButton.node.off("click", this.onCheckButtonClick, this);
    this.updateButton.node.off("click", this.onUpdateButtonClick, this);
  }

  private onCheckButtonClick(): void {
    console.log("Check Button clicked");
    // 处理 checkButton 点击事件的逻辑
    this.messageLabel.string = "check!";
  }

  // updateButton 的点击事件处理函数
  private onUpdateButtonClick(): void {
    console.log("Update Button clicked");
    // 处理 updateButton 点击事件的逻辑
    this.messageLabel.string = "update!";
  }

  onMessage(message: string): void {}
  onProgress(progress: Progress): void {}
}
