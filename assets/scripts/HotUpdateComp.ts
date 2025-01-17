import { NATIVE } from "cc/env";
import {
  _decorator,
  game,
  native,
  path,
  Asset,
  Component,
  sys,
  CCInteger,
} from "cc";
import semver from "semver";
import cryptoJS from "crypto-js";
import HotUpdateMsgProgressComp, { Progress } from "./HotUpdateMsgProgressComp";
import { PromiseHandler } from "./PromiseHandler";
import { noop } from "./func";
const { ccclass, property } = _decorator;

@ccclass("HotUpdateComp")
export default class HotUpdateComp extends Component {
  @property(Asset)
  projectManifest!: Asset;

  @property(CCInteger)
  maxConcurrentTask: number = 4;

  @property(CCInteger)
  maxRetryCount: number = 5;

  @property(HotUpdateMsgProgressComp)
  msgProgressComp!: HotUpdateMsgProgressComp;

  private retryCount = 0;
  private storagePath = "";
  private assetManager!: native.AssetsManager;

  private checking: Promise<number> | null = null;
  private checkingHandlers: PromiseHandler<number> | null = null;

  private updating: Promise<void> | null = null;
  private updatingHandlers: PromiseHandler<void> | null = null;

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
    if (sys.os === sys.OS.ANDROID) {
      this.assetManager.setMaxConcurrentTask(this.maxConcurrentTask);
    }
  }

  protected onDestroy(): void {
    if (this.checking) {
      this.assetManager.setEventCallback(noop);
      this.checkingHandlers = null;
      this.checking = null;
    }

    if (this.updating) {
      this.assetManager.setEventCallback(noop);
      this.updatingHandlers = null;
      this.updating = null;
    }
  }

  get isChecking() {
    return !!this.checking;
  }

  doCheck() {
    if (!NATIVE) {
      return Promise.reject(
        new Error("The check feature is only supported on native platforms")
      );
    }

    if (this.isChecking || this.isUpdating) {
      return Promise.reject(
        new Error("Check or update is already in progress")
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

    this.assetManager.setEventCallback(this.checkingCallback.bind(this));
    this.assetManager.checkUpdate();

    this.checking = new Promise<number>((resolve, reject) => {
      this.checkingHandlers = { resolve, reject };
    });

    return this.checking;
  }

  get isUpdating() {
    return !!this.updating;
  }

  doUpdate() {
    if (!NATIVE) {
      return Promise.reject(
        new Error("The update feature is only supported on native platforms")
      );
    }

    if (this.isChecking || this.isUpdating) {
      return Promise.reject(
        new Error("check or update is already in progress")
      );
    }

    if (this.assetManager.getState() === native.AssetsManager.State.UNINITED) {
      const url = this.projectManifest.nativeUrl;
      this.assetManager.loadLocalManifest(url);
    }

    this.assetManager.setEventCallback(this.updatingCallback.bind(this));
    this.assetManager.update();

    this.updating = new Promise<void>((resolve, reject) => {
      this.updatingHandlers = { resolve, reject };
    });

    return this.updating;
  }

  private versionCompareHandle(versionA: string, versionB: string): number {
    return semver.compare(versionA, versionB);
  }

  private verifyCallback(_: string, asset: native.ManifestAsset): boolean {
    const compressed = asset.compressed;
    const relativePath = asset.path;

    if (compressed) {
      return true;
    }

    const ext = path.extname(relativePath);
    if (ext === ".manifest") {
      return true;
    }

    const filePath = path.join(
      native.fileUtils.getWritablePath(),
      "remote-asset-temp",
      relativePath
    );

    if (native.fileUtils.isFileExist(filePath)) {
      const data = native.fileUtils.getDataFromFile(filePath);
      const wordArry = cryptoJS.lib.WordArray.create(data);
      const md5 = cryptoJS.MD5(wordArry).toString();

      return md5 === asset.md5;
    }

    return false;
  }

  private checkingCallback(arg: native.EventAssetsManager) {
    let failed = false;
    let message = undefined;
    let totalBytes = 0;

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
        totalBytes = this.assetManager.getTotalBytes();
        break;
      default:
        break;
    }

    if (failed) {
      this.assetManager.setEventCallback(noop);
      this.checkingHandlers?.reject(new Error(message));
      this.checkingHandlers = null;
      this.checking = null;
    } else {
      this.assetManager.setEventCallback(noop);
      this.checkingHandlers?.resolve(totalBytes);
      this.checkingHandlers = null;
      this.checking = null;
    }
  }

  private updatingCallback(arg: native.EventAssetsManager) {
    let successed = false;
    let failed = false;
    let retry = false;
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
        successed = true;
        break;
      case native.EventAssetsManager.UPDATE_FAILED:
        if (this.retryCount > this.maxRetryCount) {
          this.retryCount = 0;
          message = `Update failed. ${arg.getMessage()}. Please try again later.`;
          failed = true;
        } else {
          this.retryCount++;
          message = `Update failed. ${arg.getMessage()}. Will try again ${
            this.retryCount
          }.`;
          retry = true;
        }
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

    if (retry) {
      this.scheduleOnce(() => this.assetManager.downloadFailedAssets(), 1);
    }

    if (failed) {
      this.assetManager.setEventCallback(noop);
      this.updatingHandlers?.reject(new Error(message));
      this.updatingHandlers = null;
      this.updating = null;
    }

    if (successed) {
      this.assetManager.setEventCallback(noop);
      this.updatingHandlers?.resolve();
      this.updatingHandlers = null;
      this.updating = null;

      let searchPaths = native.fileUtils.getSearchPaths();
      const newPaths = this.assetManager.getLocalManifest().getSearchPaths();
      searchPaths = [...newPaths, ...searchPaths];
      searchPaths = Array.from(new Set(searchPaths));

      localStorage.setItem("HotUpdateSearchPaths", JSON.stringify(searchPaths));
      native.fileUtils.setSearchPaths(searchPaths);

      // restart game
      this.scheduleOnce(() => game.restart(), 0);
    }
  }
}
