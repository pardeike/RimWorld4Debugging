var rimWorldFolder = ''
var rimworldVersion = ''

async function loadSetting() {
  rimWorldFolder = await getPreference('rimWorldFolder', '')
  rimworldVersion = await getPreference('rimworldVersion', '')
}

const pageFilters = {
}

const pageConditions = {
  rimworldFound: async () => {
    if (rimWorldFolder) return true
    const processes = await processInfo('RimWorldWin64.exe')
    if (processes.length === 0) return false
    rimWorldFolder = processes[0].bin.replace(/\\[^\\]+?$/, '')
    rimworldVersion = await fileProperties(processes[0].bin)
    await setPreference('rimWorldFolder', rimWorldFolder)
    await setPreference('rimworldVersion', rimworldVersion)
    return true
  },
  unityFound: async () => {
    if (!rimworldVersion) return false
    const unityRootPath = unityRoot(rimworldVersion)
    const unityVersion = await fileProperties(`${unityRootPath}\\Unity.exe`)
    const rimworldVersionShort = rimworldVersion.replace(/\.\d+$/, '')
    return unityVersion && unityVersion.indexOf(rimworldVersionShort) === 0
  }
}

const pageContinuation = {
  5: async () => rimWorldFolder && rimworldVersion,
  6: pageConditions.unityFound
}

const pageValues = {
  rimworldFolder: async () => rimWorldFolder,
  rimworldVersion: async () => rimworldVersion,
  rimworldVersionShort: async () => rimworldVersion.replace(/\.\d+$/, ''),
  unityFolder: async () => unityRoot(rimworldVersion)
}

const pageEvents = {
  openRimWorldFolder: async () => {
    openPath(rimWorldFolder)
  },
  openUnityFolder: async () => {
    openPath(unityRoot(rimworldVersion))
  },
  openUnityDownloadArchive: async () => {
    openPath('https://unity3d.com/get-unity/download/archive')
  },
  setRimWorldFolder: async () => {
    const exePath = document.getElementById('rimworldFolder').value.replace(/"$/, '').replace(/^"/, '')
    if (!exePath.match(/RimWorldWin64\.exe$/)) {
      alert('Invalid path')
      return
    }
    rimWorldFolder = exePath.replace(/\\[^\\]+?$/, '')
    rimworldVersion = await fileProperties(exePath)
    await setPreference('rimWorldFolder', rimWorldFolder)
    await setPreference('rimworldVersion', rimworldVersion)
    jumpToPage(0)
  },
  refreshRimWorld: async () => {
    jumpToPage(0)
  }
}