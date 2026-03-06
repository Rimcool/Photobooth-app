const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  navigate: (page) => ipcRenderer.send('navigate', page),
  savePhotos: (dataUrls) => ipcRenderer.send('save-photos', dataUrls),
  printPhotos: (dataUrls) => ipcRenderer.invoke('print-photos', dataUrls),
  downloadStrip: (dataUrl) => ipcRenderer.invoke('download-strip', dataUrl),
  onPhotosSaved: (callback) => {
    ipcRenderer.removeAllListeners('photos-saved');
    ipcRenderer.on('photos-saved', (_, paths) => callback(paths));
  },
});