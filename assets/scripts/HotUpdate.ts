import { NATIVE } from "cc/env";
import { native } from "cc";
import { _decorator, Asset, Component } from "cc";
const { ccclass, property } = _decorator;

interface PromiseHandlers {
  resolve: (value: string[]) => void;
  reject: (reason?: any) => void;
}

@ccclass("HotUpdate")
export default class HotUpdate extends Component {
  @property(Asset)
  projectManifest: Asset = null;

  private updating = false;
  private canRetry = false;
  private storagePath = "";
  private assetManager: native.AssetsManager = null;

  private promiseHandlers: {
    resolve: (value: string[]) => void;
    reject: (reason?: any) => void;
  } | null = null;

  protected onLoad(): void {
    if (!NATIVE) {
      return;
    }

    this.storagePath = native.fileUtils.getWritablePath() + "remote-asset";
    console.log("Storage path for remote asset: " + this.storagePath);

    this.assetManager = new native.AssetsManager(
      "",
      this.storagePath,
      this.versionCompareHandle
    );
  }

  versionCompareHandle(versionA: string, versionB: string): number {
    console.log(
      `JS Custom Version Compare: version A is ${versionA}, version B is ${versionB}`
    );

    const vA = versionA.split(".");
    const vB = versionB.split(".");

    for (let i = 0; i < vA.length; i++) {
      const a = parseInt(vA[i]);
      const b = parseInt(vB[i] || "0");
      if (a === b) {
        continue;
      } else {
        return a - b;
      }
    }

    if (vB.length > vA.length) {
      return -1;
    }

    return 0;
  }

  assetManagerEventCallback(arg: native.EventAssetsManager) {
    console.log("");
  }

  check() {
    if (this.updating) {
      return;
    }

    if (this.assetManager.getState() === native.AssetsManager.State.UNINITED) {
      const url = this.projectManifest.nativeUrl;
      this.assetManager.loadLocalManifest(url);
    }

    if (
      !this.assetManager.getLocalManifest() ||
      !this.assetManager.getLocalManifest().isLoaded()
    ) {
      return;
    }

    this.assetManager.setEventCallback(
      this.assetManagerEventCallback.bind(this)
    );

    this.assetManager.checkUpdate();
    this.updating = true;
  }
}
