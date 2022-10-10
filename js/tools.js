async function chooseDirectory(title) {
  const result = await window.electron.openDialog('showOpenDialog', {
    properties: [title, 'openDirectory']
  })
  if (result.canceled) return ''
  return result.filePaths[0]
}

function test() {
  alert('test')
}