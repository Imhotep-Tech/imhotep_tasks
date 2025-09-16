const { app, BrowserWindow, Menu, Tray, dialog, ipcMain, nativeImage, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// Configurable via env to work with any React app
const REMOTE_URL = process.env.APP_REMOTE_URL || process.env.VERCEL_APP_URL || 'https://imhotep-tasks.vercel.app';
const DEV_URL = process.env.APP_DEV_URL || 'http://localhost:3000';

// Determine dev mode without external deps
const isDev = !app.isPackaged;

// Custom protocol to return from OAuth
const CUSTOM_PROTOCOL = process.env.APP_PROTOCOL || 'imhotep-tasks';

// Paths
const userDataDir = app.getPath('userData');
const offlineDir = path.join(userDataDir, 'webapp');
const offlineIndexPath = path.join(offlineDir, 'index.html');
const etagPath = path.join(offlineDir, '.etag');

let tray = null;
let mainWindow = null;
let deeplinkUrl = null; // store if arrives before window ready

function ensureDir(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

function resolveIconPath() {
	// Prefer packaged build/icons/512x512.png or build/icon.png
	const packagedCandidates = [
		path.join(process.resourcesPath || '', 'build', 'icons', '512x512.png'),
		path.join(process.resourcesPath || '', 'build', 'icon.png'),
		path.join(process.resourcesPath || '', 'public', 'imhotep_tasks.png'),
	];
	for (const p of packagedCandidates) {
		try { if (fs.existsSync(p)) return p; } catch {}
	}
	// Dev fallbacks
	const projectRoot = path.join(__dirname, '..');
	const devCandidates = [
		path.join(projectRoot, 'build', 'icons', '512x512.png'),
		path.join(projectRoot, 'build', 'icon.png'),
		path.join(projectRoot, 'public', 'imhotep_tasks.png'),
		path.join(projectRoot, 'public', 'favicon.png'),
	];
	for (const p of devCandidates) {
		try { if (fs.existsSync(p)) return p; } catch {}
	}
	return undefined;
}

async function headETag(url) {
	try {
		const res = await fetch(url, { method: 'HEAD' });
		return res.headers.get('etag') || res.headers.get('last-modified') || '';
	} catch (e) {
		return '';
	}
}

async function downloadOffline(url) {
	ensureDir(offlineDir);
	try {
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
		const html = await res.text();
		fs.writeFileSync(offlineIndexPath, html, 'utf8');

		const etag = await headETag(url);
		if (etag) fs.writeFileSync(etagPath, etag, 'utf8');
		return true;
	} catch (err) {
		console.error('Offline download error:', err);
		return false;
	}
}

async function checkForUiUpdate(url) {
	const newTag = await headETag(url);
	let oldTag = '';
	try { oldTag = fs.readFileSync(etagPath, 'utf8'); } catch {}
	return newTag && newTag !== oldTag;
}

function createTray() {
	// Prefer the larger app icon if present
	const iconPath = resolveIconPath();
	const image = iconPath ? nativeImage.createFromPath(iconPath) : undefined;
	tray = new Tray(image || nativeImage.createEmpty());
	tray.setToolTip('Imhotep Tasks');
	const contextMenu = Menu.buildFromTemplate([
		{ label: 'Show', click: () => mainWindow && mainWindow.show() },
		{ label: 'Today', click: () => mainWindow && mainWindow.webContents.send('navigate', '/today') },
		{ label: 'All Tasks', click: () => mainWindow && mainWindow.webContents.send('navigate', '/all') },
		{ type: 'separator' },
		{ label: 'Check for UI Update', click: async () => {
			const hasUpdate = await checkForUiUpdate(getIndexUrl());
			if (hasUpdate) {
				const r = dialog.showMessageBoxSync(mainWindow, {
					type: 'info',
					buttons: ['Update Now', 'Later'],
					message: 'A new UI version is available.',
					detail: 'Reload to apply the latest React UI.'
				});
				if (r === 0) {
					await downloadOffline(getIndexUrl());
					mainWindow.reload();
				}
			} else {
				dialog.showMessageBox(mainWindow, { type: 'info', message: 'You are up to date.' });
			}
		}},
		{ type: 'separator' },
		{ label: 'Quit', role: 'quit' }
	]);
	tray.setContextMenu(contextMenu);
	tray.on('click', () => mainWindow && mainWindow.show());
}

function getIndexUrl() {
	// Load the React app root URL; index.html assumed at root
	if (isDev) return `${DEV_URL}`;
	return `${REMOTE_URL}`;
}

function resolveLoadUrl() {
	if (isDev) return DEV_URL;
	// Prefer remote, fallback to offline if available and offline
	return REMOTE_URL;
}

function isAllowedAppOrigin(urlStr) {
	try {
		const url = new URL(urlStr);
		const allowed = new Set();
		try { allowed.add(new URL(REMOTE_URL).origin); } catch {}
		try { allowed.add(new URL(DEV_URL).origin); } catch {}
		return allowed.has(url.origin);
	} catch {
		return false;
	}
}

function handleDeepLink(rawUrl) {
	deeplinkUrl = rawUrl;
	if (mainWindow) {
		mainWindow.webContents.send('auth:callback', rawUrl);
		if (mainWindow.isMinimized()) mainWindow.restore();
		mainWindow.show();
	}
}

async function createWindow() {
	const iconPath = resolveIconPath();
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		show: false,
		icon: iconPath,
		webPreferences: {
			preload: path.join(__dirname, 'preload.cjs'),
			contextIsolation: true,
			sandbox: true
		}
	});

	mainWindow.on('ready-to-show', () => {
		mainWindow.show();
		// Deliver any queued deep link after window is ready
		if (deeplinkUrl) {
			mainWindow.webContents.send('auth:callback', deeplinkUrl);
			deeplinkUrl = null;
		}
	});

	// Attempt remote load; fallback to offline index if it fails
	const targetUrl = resolveLoadUrl();
	try {
		await mainWindow.loadURL(targetUrl);
	} catch (e) {
		if (fs.existsSync(offlineIndexPath)) {
			await mainWindow.loadFile(offlineIndexPath);
		} else {
			await mainWindow.loadURL('data:text/html,<h1>Unable to load app</h1><p>Please check your connection.</p>');
		}
	}

	// Open external links (including Google OAuth) in default browser
	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		shell.openExternal(url);
		return { action: 'deny' };
	});
	mainWindow.webContents.on('will-navigate', (event, url) => {
		if (!isAllowedAppOrigin(url)) {
			event.preventDefault();
			shell.openExternal(url);
		}
	});

	// On first run in production, cache index.html for offline
	if (!isDev) {
		setTimeout(() => { downloadOffline(getIndexUrl()).catch(() => {}); }, 1000);
	}
}

// Ensure single instance to properly handle deep links
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
	app.quit();
} else {
	app.on('second-instance', (_event, argv) => {
		// On Windows/Linux, deep link appears in argv
		const linkArg = argv.find(a => typeof a === 'string' && a.startsWith(`${CUSTOM_PROTOCOL}://`));
		if (linkArg) handleDeepLink(linkArg);
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore();
			mainWindow.focus();
		}
	});
}

// macOS deep link
app.on('open-url', (event, url) => {
	event.preventDefault();
	if (url && url.startsWith(`${CUSTOM_PROTOCOL}://`)) handleDeepLink(url);
});

app.on('ready', async () => {
	// Register protocol handler (works post-install; on Linux requires .desktop with MimeType)
	try { app.setAsDefaultProtocolClient(CUSTOM_PROTOCOL); } catch {}
	createTray();
	await createWindow();

	// Handle deep link if app was launched via protocol
	if (!isDev) {
		const launchArg = process.argv.find(a => typeof a === 'string' && a.startsWith(`${CUSTOM_PROTOCOL}://`));
		if (launchArg) handleDeepLink(launchArg);
	}
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// IPC for renderer
ipcMain.handle('ui:checkForUpdate', async () => {
	return await checkForUiUpdate(getIndexUrl());
});

ipcMain.handle('ui:applyUpdate', async () => {
	const ok = await downloadOffline(getIndexUrl());
	if (ok && mainWindow) mainWindow.reload();
	return ok;
});
