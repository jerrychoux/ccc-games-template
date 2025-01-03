import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("main")
export class main extends Component {
  start() {
    let value1 = null;
    let value2 = "Hello, Cocos!";

    let result = value1 ?? value2;
    console.log(result); // 如果支持 `??`，将输出 "Hello, Cocos!"
  }

  update(deltaTime: number) {}
}
