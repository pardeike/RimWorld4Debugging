var rimWorldFolder = ''
var rimworldVersion = ''

const pageFilters = {
}

const pageConditions = {
  rimworldFound: async () => {
    const processes = await processInfo('RimWorldWin64.exe')
    if (processes.length === 0) return false
    rimWorldFolder = processes[0].bin.replace(/\\[^\\]+?$/, '')
    rimworldVersion = '1.2.3.4'
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
  refreshRimWorld: async () => {
    jumpToPage(0)
  }
}