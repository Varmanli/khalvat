import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourcePath = path.join(root, "public", "icons", "logo.jpg");

const outputs = [
  { file: ["public", "favicon.png"], size: 64, inset: 0.14, background: "#ffffff" },
  { file: ["public", "apple-touch-icon.png"], size: 180, inset: 0.14, background: "#ffffff" },
  { file: ["public", "icons", "apple-touch-icon.png"], size: 180, inset: 0.14, background: "#ffffff" },
  { file: ["public", "icons", "favicon-64.png"], size: 64, inset: 0.14, background: "#ffffff" },
  { file: ["public", "icons", "icon-192.png"], size: 192, inset: 0.14, background: "#ffffff" },
  { file: ["public", "icons", "icon-512.png"], size: 512, inset: 0.14, background: "#ffffff" },
  { file: ["public", "icons", "icon-maskable-192.png"], size: 192, inset: 0.22, background: "#ffffff" },
  { file: ["public", "icons", "icon-maskable-512.png"], size: 512, inset: 0.22, background: "#ffffff" },
];

async function ensureDirectory(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function main() {
  const source = sharp(sourcePath).rotate();
  const metadata = await source.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Could not read logo dimensions.");
  }

  const squareSize = Math.max(metadata.width, metadata.height);
  const sourceBuffer = await source
    .resize({
      width: squareSize,
      height: squareSize,
      fit: "contain",
      background: "#ffffff",
    })
    .png()
    .toBuffer();

  for (const output of outputs) {
    const destination = path.join(root, ...output.file);
    const innerSize = Math.max(1, Math.round(output.size * (1 - output.inset * 2)));
    const offset = Math.round((output.size - innerSize) / 2);

    await ensureDirectory(destination);

    const iconBuffer = await sharp(sourceBuffer)
      .resize(innerSize, innerSize, {
        fit: "contain",
        background: output.background,
      })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: output.size,
        height: output.size,
        channels: 4,
        background: output.background,
      },
    })
      .composite([
        {
          input: iconBuffer,
          left: offset,
          top: offset,
        },
      ])
      .png()
      .toFile(destination);
  }

  console.log("PWA icons generated from public/icons/logo.jpg");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
