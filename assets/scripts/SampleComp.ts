import { _decorator, Button, find, Label, ProgressBar } from "cc";
import { throttle } from "radash";
import semver from "semver";
import HotUpdateMsgProgressComp, { Progress } from "./HotUpdateMsgProgressComp";
import HotUpdateComp from "./HotUpdateComp";

const { ccclass, property } = _decorator;

@ccclass("SampleComp")
export default class SampleComp extends HotUpdateMsgProgressComp {
  @property(HotUpdateComp)
  hotUpdateComp!: HotUpdateComp;
  @property(Label)
  versionLabel!: Label;

  private checkButton!: Button;
  private updateButton!: Button;
  private messageLabel!: Label;
  private progressBar!: ProgressBar;

  private throttledCheckButtonClick = throttle(
    { interval: 5000 },
    this.onCheckButtonClick.bind(this)
  );
  private throttledUpdateButtonClick = throttle(
    { interval: 5000 },
    this.onUpdateButtonClick.bind(this)
  );

  protected onLoad(): void {
    this.checkButton = this.node
      .getChildByName("Button")!
      .getComponent(Button)!;
    this.updateButton = this.node
      .getChildByName("Button-001")!
      .getComponent(Button)!;
    this.messageLabel = find("Label", this.node)!.getComponent(Label)!;
    this.progressBar = find("ProgressBar", this.node)!.getComponent(
      ProgressBar
    )!;

    this.checkButton.node.on("click", this.throttledCheckButtonClick, this);
    this.updateButton.node.on("click", this.throttledUpdateButtonClick, this);

    this.messageLabel.string = "hello world";
    this.progressBar.progress = 0.99;
  }

  protected onDestroy(): void {
    this.checkButton.node.off("click", this.throttledCheckButtonClick, this);
    this.updateButton.node.off("click", this.throttledUpdateButtonClick, this);
  }

  protected start(): void {
    this.versionLabel.string = semver.valid("1.0.0") ?? "Null";
  }

  private onCheckButtonClick(): void {
    console.log("Check Button clicked");
    this.hotUpdateComp
      .doCheck()
      .then((value) => {
        const message =
          "New version found, please try to update. (" +
          Math.ceil(value / 1024) +
          "kb)";
        this.messageLabel.string = message;
      })
      .catch((err: Error) => {
        this.messageLabel.string = err.message;
      });
  }

  private onUpdateButtonClick(): void {
    console.log("Update Button clicked");
    // this.hotUpdateComp
    //   .doUpdate()
    //   .then(() => {})
    //   .catch((err: Error) => {
    //     this.messageLabel.string = err.message;
    //   });
  }

  onMessage(message: string): void {
    this.messageLabel.string = message;
  }

  onProgress(progress: Progress): void {
    this.progressBar.progress = progress.byteProgress;
  }
}
