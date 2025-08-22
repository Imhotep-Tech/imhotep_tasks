const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = !!process.env.ELECTRON_START_URL || process.env.NODE_ENV === 'development';
let mainWindow;

// Function to create the main window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        icon: path.join(__dirname, 'icon.png'),
    });

    // Prefer explicit dev URL if provided; otherwise load local build/index.html
    const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, 'build', 'index.html')}`;

    // If running in production (no ELECTRON_START_URL) ensure the build exists
    if (!process.env.ELECTRON_START_URL) {
        const indexPath = path.join(__dirname, 'build', 'index.html');
        if (!fs.existsSync(indexPath)) {
            dialog.showErrorBox(
                'Missing Build',
                'Local app build not found. Run the prepare script or use "start:dev" for development.\n\nTry: npm run prepare'
            );
            app.quit();
            return;
        }
    }

    mainWindow.loadURL(startUrl).catch((err) => {
        console.error('Failed to load URL:', err);
    });

    // avoid white flash
    mainWindow.once('ready-to-show', () => mainWindow.show());

    // open external links in default browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (!isInternalURL(url)) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });

    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (!isInternalURL(url)) {
            event.preventDefault();
            shell.openExternal(url);
        }
    });

    mainWindow.on('close', (e) => {
        // allow normal quit
        if (!app.isQuitting) {
            e.preventDefault();
            mainWindow.hide();
        }
    });
}

// allow file:, localhost and your official domain as internal
function isInternalURL(url = '') {
    const appDomain = 'https://imhoteptasks.pythonanywhere.com';
    return url.startsWith('file:') ||
        url.startsWith('http://localhost') ||
        url.startsWith('http://127.0.0.1') ||
        url.startsWith('https://localhost') ||
        url.startsWith(appDomain);
}

// single-instance lock
if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
        }
    });

    app.whenReady().then(() => {
        createWindow();
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
        else if (mainWindow) mainWindow.show();
    });

    app.on('before-quit', () => {
        app.isQuitting = true;
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
    });
}