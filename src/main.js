const { app, BrowserWindow, screen, ipcMain, Tray, Menu } = require('electron');
const path = require('path');

let win;
let tray = null;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width: 500,
    height: 220,
    x: Math.floor((width - 500) / 2),
    y: height - 220,
    resizable: true,
    movable: true,
    alwaysOnTop: true,
    frame: true,
    skipTaskbar: false, // hide from taskbar
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.setMenuBarVisibility(false);

  win.loadFile(path.join(__dirname, 'index.html'));

  win.once('ready-to-show', () => {
    win.show();
  });

  // IPC Events
  ipcMain.on('minimize-window', () => {
    win.hide(); // minimize to tray
  });

  ipcMain.on('close-window', () => {
    app.quit(); // full quit
  });

  // Setup tray
  tray = new Tray(path.join(__dirname, 'icon.png')); // provide your icon here (32x32 recommended)
  const trayMenu = Menu.buildFromTemplate([
    { label: 'Toggle Window', click: () => toggleWindow() },
    { label: 'Quit', click: () => app.quit() }
  ]);
  tray.setToolTip('DockNote');
  tray.setContextMenu(trayMenu);
  tray.on('click', () => toggleWindow());
}

function toggleWindow() {
  if (win.isVisible()) {
    win.hide();
  } else {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    win.setBounds({
      x: Math.floor((width - win.getBounds().width) / 2),
      y: height - win.getBounds().height,
      width: win.getBounds().width,
      height: win.getBounds().height,
    });
    win.show();
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
