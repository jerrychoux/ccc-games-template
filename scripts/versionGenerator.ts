import * as semver from "semver";
import yargs, { Options } from "yargs";
import { tryit } from "radash";

import { isValidPath } from "./utils/path";
// args
const argsOptions: Record<string, Options> = {
  version: {
    alias: "v",
    type: "string",
    description: "The version of published assets",
    demandOption: true,
    coerce: (arg: string) => {
      if (!semver.valid(arg)) {
        throw new Error(
          "Invalid version number provided. It must be in the format x.x.x"
        );
      }
      return arg;
    },
  },
  url: {
    alias: "u",
    type: "string",
    description: "The url of remote server",
    demandOption: false,
    coerce: (arg: string) => {
      const [error] = tryit(() => new URL(arg))();
      if (error) throw new Error("Invalid URL provided");
      return arg;
    },
  },
  source: {
    alias: "s",
    type: "string",
    description: "The source path of assets",
    demandOption: true,
    coerce: (arg: string) => {
      if (!isValidPath(arg)) {
        throw new Error("Invalid source path provided");
      }
      return arg;
    },
  },
  destination: {
    alias: "d",
    type: "string",
    description: "The destination path of assets",
    demandOption: true,
    coerce: (arg: string) => {
      if (!isValidPath(arg)) {
        throw new Error("Invalid destination path provided");
      }
      return arg;
    },
  },
};

const argv = yargs.version(false).options(argsOptions).argv;

interface Manifest {
  packageUrl: string;
  remoteManifestUrl: string;
  remoteVersionUrl: string;
  version: string;
  assets: {};
  searchPaths: string[];
}
