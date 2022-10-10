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
  find: (typ, val, strict) => ipcRenderer.invoke("find", typ, val, strict),
  openDialog: (method, config) => ipcRenderer.invoke("dialog", method, config),
  shell: (method, config) => ipcRenderer.invoke("shell", method, config),
  fileVersion: path => ipcRenderer.invoke("fileVersion", path)
})