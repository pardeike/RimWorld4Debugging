const dragElement = document.getElementById('drag')
if (dragElement)
  dragElement.ondragstart = (event) => {
    event.preventDefault()
    window.electron.startDrag('drag-and-drop.md')
  }