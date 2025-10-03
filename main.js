const { ipcMain, app, BrowserWindow, dialog, shell, clipboard } = require('electron')
const { promises: fs } = require("fs")
const find = require('find-process')
const winVersionInfo = require('win-version-info')
const storage = require('electron-json-storage')
const path = require('path')

const createWindow = () => {
  const win = new BrowserWindow({
    backgroundColor: '#333',
    width: 1024,
    minWidth: 1024,
    maxWidth: 1024,
    height: 768,
    minHeight: 788,
    maxHeight: 788,
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

  ipcMain.handle('copyFile', async (_, source, target) => {
    try {
      await fs.copyFile(source, target)
      return ''
    } catch (error) {
      return error
    }
  })

  ipcMain.handle('writeFile', async (_, source, text) => {
    try {
      await fs.writeFile(source, text)
      return ''
    } catch (error) {
      return error
    }
  })

  ipcMain.handle('appendIfNecessary', async (_, source, text) => {
    try {
      const file = await fs.readFile(source, 'utf8')
      if (!file.includes(text)) {
        const lineEnding = file.includes('\r\n') ? '\r\n' : '\n'
        if (file.lastIndexOf(lineEnding) !== file.length - lineEnding.length)
          text = lineEnding + text
        await fs.appendFile(source, `${text}${lineEnding}`)
      }
      return ''
    } catch (error) {
      return error
    }
  })

  ipcMain.handle('hubInstallPath', async (_) => {
    try {
      const appData = process.env.APPDATA
      const txt = await fs.readFile(`${appData}\\UnityHub\\secondaryInstallPath.json`, 'utf8')
      const path = txt.replace(/^"|"$/g, '')
      if (path) return path
    } catch (error) {
      console.log(`error: ${error}`)
    }
    return 'C:\\Program Files\\Unity\\Hub\\Editor'
  })

  ipcMain.handle('directoryExists', async (_, path) => {
    try {
      const stats = await fs.stat(path)
      return stats.isDirectory()
    } catch (error) {
      return false
    }
  })

  createWindow()
  console.log(`preferences: ${app.getPath('userData')}`)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0)
      createWindow()
  })
})