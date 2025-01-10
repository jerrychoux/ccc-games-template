import { NATIVE } from "cc/env";
import { game, native } from "cc";
import { _decorator, Asset, Component } from "cc";
import CombinedComponent from "./CombinedComponent";
const { ccclass, property } = _decorator;

interface PromiseHandlers {
  resolve: () => void;
  reject: (reason?: any) => void;
}

@ccclass("HotUpdate")
export default class HotUpdate extends Component {
  @property(Asset)
  projectManifest: Asset = null;

  @property(CombinedComponent)
  combinedComponent?: CombinedComponent = null;

  private canRetry = false;
  private storagePath = "";
  private assetManager: native.AssetsManager = null;

  private updating: Promise<void> | null = null;
  private updatingHandlers: PromiseHandlers | null = null;

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
    this.assetManager.setVerifyCallback(this.verifyCallback);
  }

  protected onDestroy(): void {
    if (this.updating) {
      this.assetManager.setEventCallback(null);
      this.updatingHandlers = null;
      this.updating = null;
    }
  }

  check() {
    if (this.updating) {
      return Promise.reject(new Error("Update is already in progress"));
    }

    if (this.assetManager.getState() === native.AssetsManager.State.UNINITED) {
      const url = this.projectManifest.nativeUrl;
      this.assetManager.loadLocalManifest(url);
    }

    if (
      !this.assetManager.getLocalManifest() ||
      !this.assetManager.getLocalManifest().isLoaded()
    ) {
      return Promise.reject(new Error("Failed to load local manifest"));
    }

    this.assetManager.setEventCallback(this.checkingCallback);
    this.assetManager.checkUpdate();

    this.updating = new Promise<void>((resolve, reject) => {
      this.updatingHandlers = { resolve, reject };
    });

    return this.updating;
  }

  hotUpdate() {
    if (this.assetManager) {
    }
  }

  private versionCompareHandle(versionA: string, versionB: string): number {
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

  private verifyCallback(path: string, asset: native.ManifestAsset): boolean {
    const compressed = asset.compressed;
    const expectedMD5 = asset.md5;
    const relativePath = asset.path;
    const size = asset.size;

    if (compressed) {
      return true;
    }

    return true;
  }

  private checkingCallback(arg: native.EventAssetsManager) {
    console.log("Code: " + arg.getEventCode());
    switch (arg.getEventCode()) {
      case native.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
        break;
      case native.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
      case native.EventAssetsManager.ERROR_PARSE_MANIFEST:
        break;
      case native.EventAssetsManager.ALREADY_UP_TO_DATE:
        break;
      case native.EventAssetsManager.NEW_VERSION_FOUND:
        break;

      default:
        break;
    }

    this.assetManager.setEventCallback(null);
    this.updatingHandlers.reject(new Error(""));
    this.updatingHandlers = null;
    this.updating = null;
  }

  private updatingCallback(arg: native.EventAssetsManager) {
    let needRestart = false;
    let failed = false;
    switch (arg.getEventCode()) {
      case native.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
        failed = true;
        break;

      case native.EventAssetsManager.UPDATE_PROGRESSION:
        break;

      case native.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
      case native.EventAssetsManager.ERROR_PARSE_MANIFEST:
        failed = true;
        break;

      case native.EventAssetsManager.ALREADY_UP_TO_DATE:
        failed = true;
        break;

      case native.EventAssetsManager.UPDATE_FINISHED:
        needRestart = true;
        break;

      case native.EventAssetsManager.UPDATE_FAILED:
        break;

      case native.EventAssetsManager.ERROR_UPDATING:
        break;

      case native.EventAssetsManager.ERROR_DECOMPRESS:
        break;

      default:
        break;
    }

    if (failed) {
      this.assetManager.setEventCallback(null);
    }

    if (needRestart) {
      this.assetManager.setEventCallback(null);

      const searchPaths = native.fileUtils.getSearchPaths();
      const newPaths = this.assetManager.getLocalManifest().getSearchPaths();
      console.log(JSON.stringify(newPaths));
      Array.prototype.unshift.apply(searchPaths, newPaths);

      localStorage.setItem("HotUpdateSearchPaths", JSON.stringify(searchPaths));
      native.fileUtils.setSearchPaths(searchPaths);

      setTimeout(() => {
        game.restart();
      }, 1000);
    }
  }
}
