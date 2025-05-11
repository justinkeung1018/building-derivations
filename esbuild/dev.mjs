import esbuild from "esbuild";

async function watch() {
  let ctx = await esbuild.context({
    entryPoints: ["./src/index.tsx", "./src/index.html"],
    outdir: "dist",
    bundle: true,
    loader: { ".html": "copy" },
    sourcemap: true,
  });
  await ctx.watch();
  await ctx.serve({
    servedir: "dist",
    fallback: "./dist/index.html",
  });
  console.log("Watching...");
}

watch();
