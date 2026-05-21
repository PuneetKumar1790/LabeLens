import sharp from 'sharp'
import fs from 'fs'

const src = 'public/assets/card.png'
const outDir = 'public/assets'

if (!fs.existsSync(src)) {
  console.error('source not found:', src)
  process.exit(1)
}

async function run() {
  // Create lossless WebP
  await sharp(src)
    .webp({ lossless: true })
    .toFile(`${outDir}/card.lossless.webp`)

  // Create lossless AVIF (good compression, lossless)
  await sharp(src)
    .avif({ lossless: true })
    .toFile(`${outDir}/card.lossless.avif`)

  // Create a responsive medium size (max width 800) in WebP lossless
  await sharp(src)
    .resize({ width: 800 })
    .webp({ lossless: true })
    .toFile(`${outDir}/card-800.lossless.webp`)

  // Create a responsive small size (max width 480) in WebP lossless
  await sharp(src)
    .resize({ width: 480 })
    .webp({ lossless: true })
    .toFile(`${outDir}/card-480.lossless.webp`)

  console.log('image conversions completed')
}

run().catch((err) => { console.error(err); process.exit(1) })
