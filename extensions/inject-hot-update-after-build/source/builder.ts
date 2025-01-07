import { BuildPlugin } from "../@types";

export const configs: BuildPlugin.Configs = {
  "*": {
    hooks: "./hooks",
  },
};
