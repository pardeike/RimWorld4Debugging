const { contextBridge, ipcRenderer, dialog } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }
  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})

contextBridge.exposeInMainWorld('electron', {
  startDrag: fileName => {
    ipcRenderer.send('ondragstart', path.join(process.cwd(), fileName))
  },
  openDialog: (method, config) => ipcRenderer.invoke("dialog", method, config)
})