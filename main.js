const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    minWidth: 800,
    height: 600,
    minHeight: 620,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  if (app.isPackaged)
    win.setMenu(null)
  win.loadFile('index.html')
}

app.on('window-all-closed', () => {
  app.quit()
})

app.whenReady().then(() => {

  ipcMain.handle("dialog", async (_, method, params) => {
    return await dialog[method](params)
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