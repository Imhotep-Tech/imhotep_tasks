const { contextBridge, ipcRenderer, shell } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    // Your code here
    });

// expose a minimal API to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
	// open external links in default browser
	openExternal: (url) => {
		if (typeof url === 'string') shell.openExternal(url);
	},

	// update management (promises for actions)
	checkForUpdates: async () => {
		return await ipcRenderer.invoke('check-for-updates');
	},
	requestDownload: async () => {
		return await ipcRenderer.invoke('download-update');
	},
	quitAndInstall: async () => {
		return await ipcRenderer.invoke('quit-and-install');
	},

	// event subscriptions (renderer provides callbacks)
	onUpdateAvailable: (cb) => {
		ipcRenderer.removeAllListeners('update-available');
		ipcRenderer.on('update-available', (e, info) => cb(info));
	},
	onDownloadProgress: (cb) => {
		ipcRenderer.removeAllListeners('download-progress');
		ipcRenderer.on('download-progress', (e, progress) => cb(progress));
	},
	onUpdateDownloaded: (cb) => {
		ipcRenderer.removeAllListeners('update-downloaded');
		ipcRenderer.on('update-downloaded', (e, info) => cb(info));
	},
	onUpdateError: (cb) => {
		ipcRenderer.removeAllListeners('update-error');
		ipcRenderer.on('update-error', (e, err) => cb(err));
	},
});