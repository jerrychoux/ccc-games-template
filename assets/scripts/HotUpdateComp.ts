import { NATIVE } from "cc/env";
import { game, native } from "cc";
import { _decorator, Asset, Component } from "cc";
import HotUpdateMsgProgressComp, { Progress } from "./HotUpdateMsgProgressComp";
import { PromiseHandlers } from "./PromiseHandlers";
const { ccclass, property } = _decorator;

@ccclass("HotUpdateComp")
export default class HotUpdateComp extends Component {
  @property(Asset)
  projectManifest: Asset = null;

  @property(HotUpdateMsgProgressComp)
  msgProgressComp?: HotUpdateMsgProgressComp = null;

  private canRetry = false;
  private storagePath = "";
  private assetManager: native.AssetsManager = null;

  private updating: Promise<void> | null = null;
  private updatingHandlers: PromiseHandlers<void> | null = null;

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

  checkUpdate() {
    if (this.updating) {
      return Promise.reject(
        new Error("check or update is already in progress")
      );
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

  retry() {}

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
    let failed = false;
    let message = undefined;

    switch (arg.getEventCode()) {
      case native.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
        message = "No local manifest file found, hot update skipped.";
        failed = true;
        break;
      case native.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
      case native.EventAssetsManager.ERROR_PARSE_MANIFEST:
        message = "Fail to download manifest file, hot update skipped.";
        failed = true;
        break;
      case native.EventAssetsManager.ALREADY_UP_TO_DATE:
        message = "Already up to date with the latest remote version.";
        failed = true;
        break;
      case native.EventAssetsManager.NEW_VERSION_FOUND:
        message =
          "New version found, please try to update. (" +
          Math.ceil(this.assetManager.getTotalBytes() / 1024) +
          "kb)";
        break;
      default:
        break;
    }

    if (message) {
      this.msgProgressComp?.onMessage(message);
    }

    if (failed) {
      this.assetManager.setEventCallback(null);
      this.updatingHandlers.reject();
      this.updatingHandlers = null;
      this.updating = null;
    } else {
      this.assetManager.setEventCallback(null);
      this.updatingHandlers.resolve();
      this.updatingHandlers = null;
      this.updating = null;
    }
  }

  private updatingCallback(arg: native.EventAssetsManager) {
    let needRestart = false;
    let failed = false;
    let message = undefined;
    let progress = undefined;

    switch (arg.getEventCode()) {
      case native.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
        message = "No local manifest file found, hot update skipped.";
        failed = true;
        break;
      case native.EventAssetsManager.UPDATE_PROGRESSION:
        message = arg.getMessage();
        const byteProgress = arg.getPercent();
        const fileProgress = arg.getPercentByFile();
        const downloadedFiles = arg.getDownloadedFiles();
        const downloadedBytes = arg.getDownloadedBytes();
        const totalFiles = arg.getTotalFiles();
        const totalBytes = arg.getTotalBytes();
        progress = {
          fileProgress,
          byteProgress,
          downloadedFiles,
          downloadedBytes,
          totalFiles,
          totalBytes,
        } as Progress;
        break;
      case native.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
      case native.EventAssetsManager.ERROR_PARSE_MANIFEST:
        message = "Fail to download manifest file, hot update skipped.";
        failed = true;
        break;
      case native.EventAssetsManager.ALREADY_UP_TO_DATE:
        message = "Already up to date with the latest remote version.";
        failed = true;
        break;
      case native.EventAssetsManager.UPDATE_FINISHED:
        message = "Update finished. " + arg.getMessage();
        needRestart = true;
        break;
      case native.EventAssetsManager.UPDATE_FAILED:
        message = "Update failed. " + arg.getMessage();
        failed = true;
        this.canRetry = true;
        break;
      case native.EventAssetsManager.ERROR_UPDATING:
        message = `Asset update error: ${arg.getAssetId()}, ${arg.getMessage()}`;
        break;
      case native.EventAssetsManager.ERROR_DECOMPRESS:
        message = arg.getMessage();
        break;
      default:
        break;
    }

    if (message) {
      this.msgProgressComp?.onMessage(message);
    }

    if (progress) {
      this.msgProgressComp?.onProgress(progress);
    }

    if (failed) {
      this.assetManager.setEventCallback(null);
      this.updatingHandlers.reject();
      this.updatingHandlers = null;
      this.updating = null;
    }

    if (needRestart) {
      this.assetManager.setEventCallback(null);
      this.updatingHandlers.resolve();
      this.updatingHandlers = null;
      this.updating = null;

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
