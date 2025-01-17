import * as fs from "fs";
import * as crypto from "crypto";
import * as semver from "semver";
import path from "path";
import yargs, { Arguments, Options } from "yargs";
import { tryit } from "radash";

import { isValidPath } from "./utils/path";

const rootDir = path.resolve(__dirname, "../../");

// args
interface Args {
  version: string;
  url: string;
  src: string;
  dest: string;
}

const defaultArgs: Partial<Args> = {
  version: "1.0.0",
  url: "http://localhost:8080",
  src: "build/android/assets/",
  dest: "assets/",
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

const src = path.resolve(rootDir, argv.src);
const dest = path.resolve(rootDir, argv.dest);

const readDir = (dir: string, obj: { [key: string]: Asset }) => {
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
        readDir(subPath, obj);
      } else if (state.isFile()) {
        const size = state.size;
        const md5 = crypto
          .createHash("md5")
          .update(fs.readFileSync(subPath))
          .digest("hex");
        const relativePath = encodeURI(
          path.relative(src, subPath).replace(/\\/g, "/")
        );

        obj[relativePath] = {
          size,
          md5,
        };

        const compressed = path.extname(subdir).toLowerCase() === ".zip";
        if (compressed) {
          obj[relativePath].compressed = true;
        }
      }
    });
  } catch (error) {
    console.error(error);
  }
};

readDir(path.join(src, "src"), manifest.assets);
readDir(path.join(src, "assets"), manifest.assets);
readDir(path.join(src, "jsb-adapter"), manifest.assets);

const projectManifest = path.join(dest, "project.manifest");
const versionManifest = path.join(dest, "version.manifest");

fs.mkdirSync(dest, { recursive: true });
fs.writeFileSync(projectManifest, JSON.stringify(manifest, null, 2));

type ModifiedManifest = Omit<Manifest, "assets" | "searchPaths"> & {
  assets?: Manifest["assets"];
  searchPaths?: Manifest["searchPaths"];
};

delete (manifest as ModifiedManifest).assets;
delete (manifest as ModifiedManifest).searchPaths;

fs.writeFileSync(versionManifest, JSON.stringify(manifest, null, 2));

console.log(`Manifest files generated at ${dest}`);
