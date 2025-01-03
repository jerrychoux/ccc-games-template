import * as fs from "fs";
import * as crypto from "crypto";
import * as semver from "semver";
import yargs, { Arguments, Options } from "yargs";
import { tryit } from "radash";

import { isValidPath } from "./utils/path";
import path from "path";
// args
interface Args {
  version: string;
  url: string;
  src: string;
  dest: string;
}

const defaultArgs: Partial<Args> = {
  version: "1.0.0",
  url: "http://localhost",
  src: "./jsb/",
  dest: "./remote-assets/",
};

const options: Record<keyof Args, Options> = {
  version: {
    alias: "v",
    type: "string",
    default: defaultArgs.version,
    description: "The version of published assets",
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
    default: defaultArgs.url,
    description: "The url of remote server",
    coerce: (arg: string) => {
      const [error] = tryit(() => new URL(arg))();
      if (error) throw new Error("Invalid URL provided");
      return arg;
    },
  },
  src: {
    alias: "s",
    type: "string",
    default: defaultArgs.src,
    description: "The source path of assets",
    coerce: (arg: string) => {
      if (!isValidPath(arg)) {
        throw new Error("Invalid source path provided");
      }
      return arg;
    },
  },
  dest: {
    alias: "d",
    type: "string",
    default: defaultArgs.dest,
    description: "The destination path of assets",
    coerce: (arg: string) => {
      if (!isValidPath(arg)) {
        throw new Error("Invalid destination path provided");
      }
      return arg;
    },
  },
};

interface Manifest {
  packageUrl: string;
  remoteManifestUrl: string;
  remoteVersionUrl: string;
  version: string;
  assets: {};
  searchPaths: string[];
}

const argv = yargs.version(false).options(options).argv as Arguments<Args>;

const manifest: Manifest = {
  packageUrl: argv.url,
  remoteManifestUrl: `${argv.url}/project.manifest`,
  remoteVersionUrl: `${argv.url}/version.manifest`,
  version: argv.version,
  assets: {},
  searchPaths: [],
};

interface Asset {
  size: number;
  md5: string;
  compressed?: boolean;
}

const readAssets = (dir: string, obj: { [key: string]: Asset }) => {
  try {
    const state = fs.statSync(dir);
    if (!state.isDirectory()) {
      return;
    }

    const subdirs = fs.readdirSync(dir);
    subdirs.forEach((subdir) => {
      // ignore hidden files
      if (subdir.startsWith(".")) {
        return;
      }

      const subPath = path.join(dir, subdir);
      const state = fs.statSync(subPath);
      if (state.isDirectory()) {
        readAssets(subPath, obj);
      } else if (state.isFile()) {
        const size = state.size;
        const md5 = crypto
          .createHash("md5")
          .update(fs.readFileSync(subPath))
          .digest("hex");
        const compressed = path.extname(subdir) === ".zip";
        const relativePath = encodeURI(
          path.relative(argv.src, subPath).replace(/\\/g, "/")
        );

        obj[relativePath] = {
          size,
          md5,
        };
        if (compressed) {
          obj[relativePath].compressed = true;
        }
      }
    });
  } catch (error) {
    console.error(error);
  }
};

readAssets(path.join(argv.src, "src"), manifest.assets);
readAssets(path.join(argv.src, "assets"), manifest.assets);
readAssets(path.join(argv.src, "jsb-adapter"), manifest.assets);

const destPath = path.join(argv.dest, "project.manifest");
const versionPath = path.join(argv.dest, "version.manifest");

fs.mkdirSync(argv.dest, { recursive: true });
fs.writeFileSync(destPath, JSON.stringify(manifest, null, 2));

type ModifiedManifest = Omit<Manifest, "assets" | "searchPaths"> & {
  assets?: Manifest["assets"];
  searchPaths?: Manifest["searchPaths"];
};

delete (manifest as ModifiedManifest).assets;
delete (manifest as ModifiedManifest).searchPaths;

fs.writeFileSync(versionPath, JSON.stringify(manifest, null, 2));

console.log(`Manifest files generated at ${argv.dest}`);
