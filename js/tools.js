async function chooseDirectory(title) {
  const result = await window.electron.openDialog('showOpenDialog', {
    properties: [title, 'openDirectory']
  })
  if (result.canceled) return ''
  return result.filePaths[0]
}

async function processInfo(name) {
  return await window.electron.find('name', name, true)
}

function openPath(path) {
  window.electron.shell('openPath', path)
}

function fileProperties(path) {
  return window.electron.fileVersion(path)
}