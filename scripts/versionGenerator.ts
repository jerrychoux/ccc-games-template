import * as os from "os";
import * as path from "path";
import * as semver from "semver";
import { tryit } from "radash";
import yargs, { Options } from "yargs";

// args
// > node version_generator.js -v 1.0.0 -u http://your-server-address/tutorial-hot-update/remote-assets/ -s native/package/ -d assets/
const version: Options = {
  alias: "v",
  type: "string",
  description: "The version of project",
  demandOption: true,
  //   coerce: (arg: string) => {
  //     if (!semver.valid(arg)) {
  //       throw new Error(
  //         "Invalid version number provided. It must be in the format x.x.x"
  //       );
  //     }
  //     return arg;
  //   },
};

const url: Options = {
  alias: "u",
  type: "string",
  description: "The url of remote server",
  demandOption: false,
  coerce: (arg: string) => {
    const [error] = tryit(() => new URL(arg))();
    if (error) throw new Error("Invalid URL provided");
    return arg;
  },
};

const argv = yargs.options({
  //   version,
  url,
  src: {
    alias: "s",
    type: "string",
    description: "The source path of assets",
    demandOption: true,
  },
  dest: {
    alias: "d",
    type: "string",
    description: "The destination path of assets",
    demandOption: false,
  },
}).argv;

interface Manifest {
  packageUrl: string;
  remoteManifestUrl: string;
  remoteVersionUrl: string;
  version: string;
  assets: {};
  searchPaths: string[];
}

const isValidWindowsAbsolutePath = (pathString: string) => {
  const regex = /^[a-zA-Z]:[\\/](?:[^\x00-\x1F\x7F<>:"/\\|?*]+[\\/]?)*$/;
  return regex.test(pathString);
};

const isValidUnixAbsolutePath = (pathString: string) => {
  const regex = /^\/([^\x00-\x1F\x7F/]+(?:\/[^\x00-\x1F\x7F/]+)*)\/?$/;
  return regex.test(pathString);
};

const isValidWindowsRelativePath = (pathString: string) => {
  const regex = /^(?:[^\x00-\x1F\x7F<>:"/\\|?*]+[\\/]?)*$/;
  return regex.test(pathString);
};

const isValidUnixRelativePath = (pathString: string) => {
  const regex = /^([^\x00-\x1F\x7F/]+(?:\/[^\x00-\x1F\x7F/]+)*)\/?$/;
  return regex.test(pathString);
};

console.log(isValidWindowsAbsolutePath("c:\\a/"));
console.log(isValidUnixAbsolutePath("/a/b/c\\"));

console.log(isValidWindowsRelativePath("../.././a/"));
console.log(isValidUnixRelativePath("a/b/c\\"));
