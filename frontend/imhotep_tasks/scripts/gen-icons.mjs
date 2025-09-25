import { execSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const projectRoot = resolve(process.cwd())
const src = resolve(projectRoot, 'public', 'imhotep_tasks.png')
const outDir = resolve(projectRoot, 'build', 'icons')

if (!existsSync(src)) {
	console.error('Source icon not found:', src)
	process.exit(1)
}
if (!existsSync(outDir)) {
	mkdirSync(outDir, { recursive: true })
}

const sizes = [16, 32, 48, 64, 128, 256, 512]
for (const s of sizes) {
	const dst = resolve(outDir, `${s}x${s}.png`)
	execSync(`magick convert "${src}" -resize ${s}x${s} "${dst}"`)
	console.log('Generated', dst)
}
// Also copy a canonical appId-named PNG to help DEs
const appIdPng = resolve(outDir, 'com.imhotep.tasks.png')
execSync(`magick convert "${src}" -resize 512x512 "${appIdPng}"`)
console.log('Generated', appIdPng)
