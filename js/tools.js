async function setProgress(value, total) {
  const holder = document.getElementById('progressHolder')
  if (!holder) return
  holder.style.display = value < 0 ? 'none' : 'block'
  const progress = document.getElementById('progress')
  if (!progress) return
  progress.style.width = `${value < 0 ? 0 : Math.round(value / total * 100)}%`
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

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

async function copyToClipboard(text) {
  await window.electron.clipboard('writeText', text)
}

async function fileProperties(path) {
  return await window.electron.fileVersion(path)
}

async function unityEditorsRoot(rimWorldVersion, subpath) {
  const version = rimWorldVersion.replace(/\.\d+$/, '') + 'f1'
  var res = `${await window.electron.hubInstallPath()}\\${version}\\Editor`
  if (subpath) res += '\\' + subpath
  return res
}

async function directoryExists(path) {
  return await window.electron.directoryExists(path)
}

async function copyFile(source, target) {
  return await window.electron.copyFile(source, target)
}

async function writeFile(source, target) {
  return await window.electron.writeFile(source, target)
}

async function appendIfNecessary(source, text) {
  return await window.electron.appendIfNecessary(source, text)
}