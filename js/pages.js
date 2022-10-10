var rimWorldFolder = ''
var rimworldVersion = ''

const pageFilters = {
}

const pageConditions = {
  rimworldFound: async () => {
    if (rimWorldFolder) return true
    const processes = await processInfo('RimWorldWin64.exe')
    if (processes.length === 0) return false
    rimWorldFolder = processes[0].bin.replace(/\\[^\\]+?$/, '')
    rimworldVersion = fileProperties(processes[0].bin)
    return true
  }
}

const pageValues = {
  rimworldFolder: async () => rimWorldFolder,
  rimworldVersion: async () => rimworldVersion
}

const pageEvents = {
  openRimWorldFolder: async () => {
    openPath(rimWorldFolder)
  },
  setRimWorldFolder: async () => {
    const exePath = document.getElementById('rimworldFolder').value.replace(/"$/, '').replace(/^"/, '')
    if (!exePath.match(/RimWorldWin64\.exe$/)) {
      alert('Invalid path')
      return
    }
    rimWorldFolder = exePath.replace(/\\[^\\]+?$/, '')
    rimworldVersion = fileProperties(exePath)
    jumpToPage(0)
  },
  refreshRimWorld: async () => {
    jumpToPage(0)
  }
}