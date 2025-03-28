import { app, shell, BrowserWindow, ipcMain, Tray, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { registerFileIpcHandlers } from './ipcHandlers/fileIPC'
import { registerUserIpcHandlers } from './ipcHandlers/userIPC'
import path from "node:path"
import { backupInterval, registerWatcherIPCHandlers } from './ipcHandlers/watcherIPC'
import { cleanUpWatchers } from './helper'
import { closeDB, connectDB } from './db'


export let mainWindow: BrowserWindow;
let tray:Tray;
let isQuitting:boolean = false;

type WindowState = 'shown' | 'hidden';
let windowState: WindowState = 'shown';

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('Nimbus', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('Nimbus')
}

function createWindow(): void {
  // Create the browser window.
   mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation:true,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      windowState = 'hidden';
    }
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', function () {
    // if someone tried to run a second instance, focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.handle("test",async()=>{
    console.log("test ipc called");
  })

  createWindow()

  tray = new Tray(icon); // Use your app's icon here
  const contextMenu = Menu.buildFromTemplate([
      { label: 'Show App', click: () => {
        mainWindow.show()
        windowState = 'shown'
      }},
      { label: 'Quit', click: () => {
        isQuitting = true
        app.quit()
        
      }}
  ]);
  tray.setToolTip('Nimbus');
  tray.setContextMenu(contextMenu);

  await connectDB()
  registerUserIpcHandlers()
  registerFileIpcHandlers()
  registerWatcherIPCHandlers()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on("before-quit", async () => {
  if (backupInterval) {
    clearInterval(backupInterval);
    console.log("Backup interval cleared.");
  }
  await cleanUpWatchers();
  await closeDB();
});


app.on("window-all-closed", async () => {
  // await cleanUpWatchers();
  
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
