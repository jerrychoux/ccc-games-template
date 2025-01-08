import * as esbuild from "esbuild";

const entryPoints = ["./src/manifestGenerate.ts"];

esbuild
  .build({
    entryPoints: entryPoints, // 输入文件
    outdir: "./dist",
    bundle: true, // 启用捆绑
    minify: true,
    platform: "node", // 目标平台为 Node.js
    target: "node14", // 目标 Node.js 版本
    format: "cjs", // 输出 CommonJS 格式
    outExtension: { ".js": ".cjs" }, // 将 .js 文件扩展名替换为 .cjs
  })
  .then(() => {
    console.log("Build successfully!");
  })
  .catch((error) => {
    console.error("Build failed:", error.message);
  });
