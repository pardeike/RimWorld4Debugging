const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron')
const find = require('find-process')
const winVersionInfo = require('win-version-info')
const path = require('path')

const createWindow = () => {
  const win = new BrowserWindow({
    backgroundColor: '#333',
    width: 1024,
    minWidth: 1024,
    height: 768,
    minHeight: 788,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  })
  if (app.isPackaged)
    win.setMenu(null)
  win.loadFile('index.html')
  win.webContents.on('did-finish-load', function () {
    setTimeout(() => win.show(), 120)
  })
}

app.on('window-all-closed', () => {
  app.quit()
})

app.whenReady().then(() => {

  ipcMain.handle("find", async (_, typ, val, strict) => {
    return await find(typ, val, strict)
  })

  ipcMain.handle("dialog", async (_, method, params) => {
    return await dialog[method](params)
  })

  ipcMain.handle("shell", async (_, method, params) => {
    return await shell[method](params)
  })

  ipcMain.handle("fileVersion", async (_, path) => {
    return winVersionInfo(path).FileVersion
  })

  ipcMain.on('ondragstart', (event, filePath) => {
    console.log(`ondragstart: ${filePath}`)
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0)
      createWindow()
  })
})