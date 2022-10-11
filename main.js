const { app, BrowserWindow, dialog, ipcMain, shell, clipboard } = require('electron')
const find = require('find-process')
const winVersionInfo = require('win-version-info')
const storage = require('electron-json-storage')
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

  ipcMain.handle('has', async (_, key) => {
    return await new Promise((resolve, reject) => {
      storage.has(key, (err, hasKey) => {
        if (err) reject(err)
        else resolve(hasKey)
      })
    })
  })

  ipcMain.handle('load', async (_, key) => {
    return await new Promise((resolve, reject) => {
      storage.get(key, (err, value) => {
        if (err) reject(err)
        else resolve(value)
      })
    })
  })

  ipcMain.handle('save', async (_, key, value) => {
    await new Promise((resolve, reject) => {
      storage.set(key, value, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  })

  ipcMain.handle('find', async (_, typ, val, strict) => {
    return await find(typ, val, strict)
  })

  ipcMain.handle('dialog', async (_, method, params) => {
    return await dialog[method](params)
  })

  ipcMain.handle('shell', async (_, method, params) => {
    return await shell[method](params)
  })

  ipcMain.handle('clipboard', async (_, method, params) => {
    return await clipboard[method](params)
  })

  ipcMain.handle('fileVersion', (_, path) => {
    try {
      const info = winVersionInfo(path)
      if (!info) return null
      return info.FileVersion
    } catch (error) {
      return null
    }
  })

  ipcMain.on('ondragstart', (_, filePath) => {
    console.log(`ondragstart: ${filePath}`)
  })

  createWindow()

  console.log(`preferences: ${app.getPath('userData')}`)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0)
      createWindow()
  })
})