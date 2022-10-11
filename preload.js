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
  has: (key) => ipcRenderer.invoke('has', key),
  load: (key) => ipcRenderer.invoke('load', key),
  save: (key, val) => ipcRenderer.invoke('save', key, val),
  find: (typ, val, strict) => ipcRenderer.invoke('find', typ, val, strict),
  openDialog: (method, config) => ipcRenderer.invoke('dialog', method, config),
  shell: (method, config) => ipcRenderer.invoke('shell', method, config),
  clipboard: (method, config) => ipcRenderer.invoke('clipboard', method, config),
  fileVersion: path => ipcRenderer.invoke('fileVersion', path),
  copyFile: (source, target) => ipcRenderer.invoke('copyFile', source, target),
  writeFile: (source, text) => ipcRenderer.invoke('writeFile', source, text),
  appendIfNecessary: (source, text) => ipcRenderer.invoke('appendIfNecessary', source, text),
  hubInstallPath: () => ipcRenderer.invoke('hubInstallPath')
})