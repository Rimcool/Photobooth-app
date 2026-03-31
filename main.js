const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    frame: false,  // Frameless for modern photobooth look (add close button in HTML if needed)
    kiosk: false,  // Set to true for full-screen locked mode
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  mainWindow.loadFile('index.html');
  // Allow camera/media permission requests from renderer
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') return callback(true);
    callback(false);
  });
  // mainWindow.setMenu(null);  // No menu, or customize below

  // Optional custom menu
  const menu = Menu.buildFromTemplate([
    { label: 'File', submenu: [{ label: 'Quit', click: () => app.quit() }] }
  ]);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC navigation (unchanged)
ipcMain.on('navigate', (event, page) => {
  if (!mainWindow) return;
  if (page === 'capture') mainWindow.loadFile('capture.html');
  else if (page === 'gallery') mainWindow.loadFile('gallery.html');
  else if (page === 'welcome') mainWindow.loadFile('index.html');
});

// Save photo IPC (now handles multiple)
ipcMain.on('save-photos', (event, dataUrls) => {
  const paths = [];
  dataUrls.forEach((dataUrl, i) => {
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    const filePath = path.join(__dirname, 'photos', `snap-${Date.now()}-${i}.png`);
    fs.mkdirSync(path.join(__dirname, 'photos'), { recursive: true });
    fs.writeFileSync(filePath, base64Data, 'base64');
    paths.push(filePath);
  });
  event.reply('photos-saved', paths);  // Reply with paths for sharing/printing
});

// Save strip image to user's PC (Downloads or chosen path)
ipcMain.handle('download-strip', async (event, dataUrl) => {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return { success: false, canceled: false, error: 'Invalid strip data.' };
  }

  const defaultPath = path.join(app.getPath('downloads'), `photobooth-strip-${Date.now()}.png`);
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Photo Strip',
    defaultPath,
    filters: [{ name: 'PNG Image', extensions: ['png'] }]
  });

  if (canceled || !filePath) {
    return { success: false, canceled: true };
  }

  try {
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(filePath, base64Data, 'base64');
    return { success: true, canceled: false, filePath };
  } catch (error) {
    return { success: false, canceled: false, error: error.message };
  }
});

// Print IPC
ipcMain.handle('print-photos', async (event, dataUrls) => {
  const printWindow = new BrowserWindow({ show: false });
  let html = '<body style="margin:0;">';
  dataUrls.forEach(url => html += `<img src="${url}" style="width:100%; margin-bottom:10px;">`);
  html += '</body>';
  printWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(html)}`);
  printWindow.webContents.on('did-finish-load', () => {
    printWindow.webContents.print({ silent: false, printBackground: true }, (success, error) => {
      if (!success) console.error('Print error:', error);
      printWindow.close();
    });
  });
});

// Share: we'll handle in renderer, but add shell open if needed