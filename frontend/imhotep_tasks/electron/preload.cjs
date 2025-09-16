const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
	checkForUpdate: () => ipcRenderer.invoke('ui:checkForUpdate'),
	applyUpdate: () => ipcRenderer.invoke('ui:applyUpdate'),
	navigate: (path) => ipcRenderer.send('navigate', path),
});

ipcRenderer.on('navigate', (_evt, path) => {
	window.postMessage({ type: 'desktop:navigate', path }, '*');
});

// Forward OAuth/deep-link callbacks to the renderer
ipcRenderer.on('auth:callback', (_evt, url) => {
	window.postMessage({ type: 'desktop:auth-callback', url }, '*');
});
