// ProgressHandler 接口：定义进度处理方法
export interface ProgressHandler {
  onProgress(progress: number): void;
}
