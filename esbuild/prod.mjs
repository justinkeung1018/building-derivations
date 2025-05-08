import esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["./src/index.tsx", "./src/index.html"],
  outdir: "dist",
  minify: true,
  bundle: true,
  loader: { ".html": "copy" },
});
