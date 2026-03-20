// Run: node scripts/generate-icons.js
// Requires: npm install canvas (optional - or use an online tool)
//
// Alternative: Use https://maskable.app/editor to generate PWA icons
// Upload your logo and export as:
//   - 192x192 → public/icons/icon-192x192.png
//   - 512x512 → public/icons/icon-512x512.png
//   - 180x180 → public/icons/apple-touch-icon.png

const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

function generateIcon(size, outputPath) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#10B981')
  gradient.addColorStop(1, '#059669')
  ctx.fillStyle = gradient
  ctx.roundRect(0, 0, size, size, size * 0.22)
  ctx.fill()

  // Emoji
  ctx.font = `${size * 0.55}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('💰', size / 2, size / 2)

  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(outputPath, buffer)
  console.log(`Generated: ${outputPath}`)
}

const iconsDir = path.join(__dirname, '../public/icons')
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true })

generateIcon(192, path.join(iconsDir, 'icon-192x192.png'))
generateIcon(512, path.join(iconsDir, 'icon-512x512.png'))
generateIcon(180, path.join(iconsDir, 'apple-touch-icon.png'))
