import { _decorator, Button, Component, EditBox, Node, Toggle } from "cc";
import { throttle } from "radash";
const { ccclass, property } = _decorator;

@ccclass("ConsolePanel")
export class ConsolePanel extends Component {
  @property(Button)
  closeButton!: Button;
  @property(Button)
  clearButton!: Button;
  @property(Button)
  searchButton!: Button;
  @property(Button)
  submitButton!: Button;

  @property(EditBox)
  searchEditBox!: EditBox;
  @property(EditBox)
  commandEditBox!: EditBox;

  @property(Toggle)
  logCheck!: Toggle;
  @property(Toggle)
  infoCheck!: Toggle;
  @property(Toggle)
  warningCheck!: Toggle;
  @property(Toggle)
  errorCheck!: Toggle;

  private throttledCloseClick = throttle(
    { interval: 200 },
    this.onCloseClick.bind(this)
  );

  private throttledClearClick = throttle(
    { interval: 200 },
    this.onClearClick.bind(this)
  );

  private throttledSearchClick = throttle(
    { interval: 200 },
    this.onSearchClick.bind(this)
  );

  private throttledonSubmitClick = throttle(
    { interval: 200 },
    this.onSubmitClick.bind(this)
  );

  protected onLoad(): void {
    this.closeButton.node.on("click", this.throttledCloseClick, this);
    this.clearButton.node.on("click", this.throttledClearClick, this);
    this.searchButton.node.on("click", this.throttledSearchClick, this);
    this.submitButton.node.on("click", this.throttledonSubmitClick, this);
  }

  protected onDestroy(): void {
    this.closeButton.node.off("click", this.throttledCloseClick, this);
    this.clearButton.node.off("click", this.throttledClearClick, this);
    this.searchButton.node.off("click", this.throttledSearchClick, this);
    this.submitButton.node.off("click", this.throttledonSubmitClick, this);
  }

  private onCloseClick() {
    this.node.active = false;
  }

  private onClearClick() {}

  private onSearchClick() {}

  private onSubmitClick() {}
}
