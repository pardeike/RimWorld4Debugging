var rimWorldFolder = ''
var rimworldVersion = ''
var hubIsDownloading = false

async function loadSetting() {
  rimWorldFolder = await getPreference('rimWorldFolder', '')
  rimworldVersion = await getPreference('rimworldVersion', '')
}

const pageFilters = {
}

const pageSecondTick = {
  6: async () => {
    hubIsDownloading = await pageConditions.unityFound()
    return hubIsDownloading
  }
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
    const unityRootPath = await unityEditorsRoot(rimworldVersion)
    const unityVersion = await fileProperties(`${unityRootPath}\\Unity.exe`)
    const rimworldVersionShort = rimworldVersion.replace(/\.\d+$/, '')
    return unityVersion && unityVersion.indexOf(rimworldVersionShort) === 0
  },
  hubIsDownloading: async () => hubIsDownloading,
  filesCopied: async () => await getPreference('filesCopied', false)
}

const pageContinuation = {
  5: async () => rimWorldFolder && rimworldVersion,
  6: pageConditions.unityFound
}

const pageValues = {
  rimworldFolder: async () => rimWorldFolder,
  rimworldVersion: async () => rimworldVersion,
  rimworldVersionShort: async () => rimworldVersion.replace(/\.\d+$/, ''),
  unityFolder: async () => await unityEditorsRoot(rimworldVersion),
  unityDevMono: async () => {
    const basePath = 'Data\\PlaybackEngines\\windowsstandalonesupport\\Variations'
    // Try new path first (Unity Hub 3.14+)
    const newPath = await unityEditorsRoot(rimworldVersion, `${basePath}\\win64_player_development_mono`)
    if (await directoryExists(newPath)) {
      return newPath
    }
    // Fall back to old path (older Unity Hub versions)
    return await unityEditorsRoot(rimworldVersion, `${basePath}\\win64_development_mono`)
  },
  rimworldManagedFolder: async () => rimWorldFolder + '\\RimWorldWin64_Data\\Managed',
  rimworldExportSuggestion: async () => rimWorldFolder.replace(/\\[^\\]+$/, ''),
  rimworldExportFolder: async () => rimWorldFolder.replace(/\\[^\\]+$/, '') + '\\Assembly-CSharp',
  rimworldDebugSolution: async () => rimWorldFolder.replace(/\\[^\\]+$/, '') + '\\Assembly-CSharp\\Assembly-CSharp.sln'
}

const pageEvents = {
  openRimWorldFolder: async () => {
    await openPath(rimWorldFolder)
  },
  openUnityFolder: async () => {
    await openPath(await unityEditorsRoot(rimworldVersion))
  },
  openRimWorldManaged: async () => {
    await openPath(await pageValues.rimworldManagedFolder())
  },
  openRimWorldAssemblyCSharp: async () => {
    await openPath(await pageValues.rimworldManagedFolder() + '\\Assembly-CSharp.dll')
  },
  openUnityDownloadArchive: async () => {
    await openPath('https://unity3d.com/get-unity/download/archive')
  },
  openRimworldDebugSolution: async () => {
    await openPath(await pageValues.rimworldDebugSolution())
  },
  resetRimWorldLocation: async () => {
    rimWorldFolder = ''
    rimworldVersion = ''
    jumpToPage(0)
  },
  triggerHubDownload: async () => {
    hubIsDownloading = true
    await openPath(`unityhub://${await pageValues.rimworldVersionShort()}f1`)
    jumpToPage(0)
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

    await sleep(200)
    setProgress(-1, 0)
    await setPreference('filesCopied', true)
    jumpToPage(0)
  },
  resetPatch: async () => {
    await setPreference('filesCopied', false)
    jumpToPage(0)
  }
}