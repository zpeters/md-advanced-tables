import typescript from "@rollup/plugin-typescript";
const pkg = require("./package.json");

export default {
  input: "lib/index.ts",
  external: Object.keys(pkg.dependencies || {}),
  plugins: [typescript()],
  output: [
    {
      dir: "dist/.",
      format: "cjs",
      //file: pkg.main,
      sourcemap: true,
    },
    {
      dir: "dist/.",
      format: "es",
      //file: pkg.module,
      sourcemap: true,
    },
  ],
};
