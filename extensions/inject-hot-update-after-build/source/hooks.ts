import * as fs from "fs";
import * as path from "path";

import { BuildHook, IBuildResult, ITaskOptions } from "../@types";

const INJECT_SCRIPT = `
(function () {
    if (typeof window.jsb === 'object') {
        var hotUpdateSearchPaths = localStorage.getItem('HotUpdateSearchPaths');
        if (hotUpdateSearchPaths) {
            var paths = JSON.parse(hotUpdateSearchPaths);
            jsb.fileUtils.setSearchPaths(paths);

            var fileList = [];
            var storagePath = paths[0] || '';
            var tempPath = storagePath + '_temp/';
            var baseOffset = tempPath.length;

            if (jsb.fileUtils.isDirectoryExist(tempPath) && !jsb.fileUtils.isFileExist(tempPath + 'project.manifest.temp')) {
                jsb.fileUtils.listFilesRecursively(tempPath, fileList);
                fileList.forEach(srcPath => {
                    var relativePath = srcPath.substr(baseOffset);
                    var dstPath = storagePath + relativePath;

                    if (srcPath[srcPath.length] == '/') {
                        jsb.fileUtils.createDirectory(dstPath)
                    }
                    else {
                        if (jsb.fileUtils.isFileExist(dstPath)) {
                            jsb.fileUtils.removeFile(dstPath)
                        }
                        jsb.fileUtils.renameFile(srcPath, dstPath);
                    }
                })
                jsb.fileUtils.removeDirectory(tempPath);
            }
        }
    }
})();
`;

export const onAfterBuild: BuildHook.onAfterBuild = async function (
  _options: ITaskOptions,
  result: IBuildResult
) {
  let url = path.join(result.dest, "data", "main.js");
  if (!fs.existsSync(url)) {
    url = path.join(result.dest, "assets", "main.js");
  }

  try {
    const data = fs.readFileSync(url, "utf-8");
    const newScript = INJECT_SCRIPT + data;
    fs.writeFileSync(url, newScript);
    console.warn("SearchPath updated in built main.js for hot update");
  } catch (err) {
    throw err;
  }
};
