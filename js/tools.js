async function hasPreference(key) {
  return await window.electron.has(key)
}

async function getPreference(key, defaultValue) {
  if (!await window.electron.has(key))
    return defaultValue
  return await window.electron.load(key) ?? defaultValue
}

async function setPreference(key, value) {
  await window.electron.save(key, value)
}

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

async function openPath(path) {
  await window.electron.shell('openPath', path)
}

async function fileProperties(path) {
  return await window.electron.fileVersion(path)
}

function unityRoot(rimWorldVersion) {
  const version = rimWorldVersion.replace(/\.\d+$/, '') + 'f1'
  return `C:\\Program Files\\Unity\\Hub\\Editor\\${version}\\Editor`
}