var rimWorldFolder = ''
var rimworldVersion = ''
var isPatched = false

async function loadSetting() {
  rimWorldFolder = await getPreference('rimWorldFolder', '')
  rimworldVersion = await getPreference('rimworldVersion', '')
  isPatched = await getPreference('isPatched', false)
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
  },
  isPatched: async () => isPatched
}

const pageContinuation = {
  5: async () => rimWorldFolder && rimworldVersion,
  6: pageConditions.unityFound,
  9: async () => isPatched
}

const pageValues = {
  rimworldFolder: async () => rimWorldFolder,
  rimworldVersion: async () => rimworldVersion,
  rimworldVersionShort: async () => rimworldVersion.replace(/\.\d+$/, ''),
  unityFolder: async () => unityRoot(rimworldVersion),
  unityDevMono: async () => unityRoot(rimworldVersion, 'Data\\PlaybackEngines\\windowsstandalonesupport\\Variations\\win64_development_mono'),
  rimworldManagedFolder: async () => rimWorldFolder + '\\RimWorldWin64_Data\\Managed',
  rimworldExportSuggestion: async () => rimWorldFolder.replace(/\\[^\\]+$/, ''),
  rimworldExportFolder: async () => rimWorldFolder.replace(/\\[^\\]+$/, '') + '\\Assembly-CSharp',
  rimworldDebugSolution: async () => rimWorldFolder.replace(/\\[^\\]+$/, '') + '\\Assembly-CSharp\\Assembly-CSharp.sln'
}

const pageEvents = {
  openRimWorldFolder: async () => {
    openPath(rimWorldFolder)
  },
  openUnityFolder: async () => {
    openPath(unityRoot(rimworldVersion))
  },
  openRimWorldManaged: async () => {
    openPath(await pageValues.rimworldManagedFolder())
  },
  openRimWorldAssemblyCSharp: async () => {
    openPath(await pageValues.rimworldManagedFolder() + '\\Assembly-CSharp.dll')
  },
  openUnityDownloadArchive: async () => {
    openPath('https://unity3d.com/get-unity/download/archive')
  },
  openRimworldDebugSolution: async () => {
    openPath(await pageValues.rimworldDebugSolution())
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
  },
  copyExportFolderToClipboard: async () => {
    const txt = await pageValues.rimworldExportSuggestion()
    copyToClipboard(txt)
  },
  copyFiles: async () => {
    const rimworldExportFolder = await pageValues.rimworldExportFolder()
    const rimworldManagedFolder = await pageValues.rimworldManagedFolder()
    const unityDevMono = await pageValues.unityDevMono()
    const filesToCopy = [
      {
        from: `${rimworldExportFolder}\\Assembly-CSharp.pdb`,
        to: `${rimworldManagedFolder}\\Assembly-CSharp.pdb`
      },
      {
        from: `${unityDevMono}\\UnityPlayer.dll`,
        to: `${rimWorldFolder}\\UnityPlayer.dll`
      },
      {
        from: `${unityDevMono}\\WindowsPlayer.exe`,
        to: `${rimWorldFolder}\\RimWorldWin64.exe`
      },
      {
        from: `${unityDevMono}\\WinPixEventRuntime.dll`,
        to: `${rimWorldFolder}\\WinPixEventRuntime.dll`
      },
      {
        from: `${unityDevMono}\\MonoBleedingEdge\\EmbedRuntime\\mono-2.0-bdwgc.dll`,
        to: `${rimWorldFolder}\\MonoBleedingEdge\\EmbedRuntime\\mono-2.0-bdwgc.dll`
      }
    ]

    const total = filesToCopy.length + 2
    setProgress(0, total)

    var n = 0
    for (const file of filesToCopy) {
      const error = await copyFile(file.from, file.to)
      if (error)
        alert(`Error copying ${file.from} to ${file.to}: ${error}`)
      else
        await sleep(200)
      setProgress(++n, total)
    }

    const err1 = await appendIfNecessary(`${rimWorldFolder}\\RimWorldWin64_Data\\boot.config`, 'player-connection-debug=1')
    if (err1)
      alert(`Error appending to boot.config: ${err1}`)
    else
      await sleep(200)
    setProgress(++n, total)

    const err2 = await writeFile(`${rimworldManagedFolder}\\Assembly-CSharp.ini`, '[.NET Framework Debugging Control]\r\nGenerateTrackingInfo=1\r\nAllowOptimize=0')
    if (err2)
      alert(`Error writing to Assembly-CSharp.ini: ${err2}`)
    else
      await sleep(200)
    setProgress(++n, total)

    isPatched = true
    await setPreference('isPatched', isPatched)

    await sleep(200)
    setProgress(-1, 0)
    jumpToPage(0)
  }
}