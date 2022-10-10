var currentPage = 5
const totalPages = (() => {
  for (let i = 1; true; i++) {
    if (!document.getElementById(`page${i}`))
      return i - 1
  }
})()
const nextButtonHTML = document.getElementById(`next`).innerHTML.replace('<div>', '<div id="nextButton">')

document.querySelector('#nav-prev').addEventListener('click', () => {
  jumpToPage(-1)
  return false
})

document.querySelector('#nav-next').addEventListener('click', () => {
  jumpToPage(1)
  return false
})

async function jumpToPage(delta) {
  currentPage = Math.min(totalPages, Math.max(1, currentPage + delta))
  document.getElementById('nav-text').innerHTML = `Step ${currentPage} of ${totalPages}`
  const pageContent = document.getElementById(`page${currentPage}`)
  if (pageContent) {
    var html = pageContent.innerHTML
    const contentElement = document.getElementById('content')

    const pageFilter = pageFilters[currentPage]
    if (pageFilter)
      html = await pageFilter(html)

    var keys = Object.keys(pageConditions)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const show = await pageConditions[key]()
      if (show)
        html = html.replace(new RegExp(`<!-- *ELSE:${key} *-->.+?<!-- *END *-->`, 'smg'), '')
      else
        html = html.replace(new RegExp(`<!-- *IF:${key} *-->.+?<!-- *END *-->`, 'smg'), '')
    }

    keys = Object.keys(pageValues)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const value = await pageValues[key]()
      html = html.replace(new RegExp(`"VAL:${key}"`, 'smg'), value)
      html = html.replace(new RegExp(`<!-- *VAL:${key} *-->`, 'smg'), value)
    }

    const eventFunctions = {}
    keys = Object.keys(pageEvents)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const idStr = `id="CLICK:${key}"`
      if (html.indexOf(idStr) >= 0) {
        html = html.replace(new RegExp(idStr, 'smg'), `id="${key}"`)
        eventFunctions[key] = pageEvents[key]
      }
    }

    contentElement.innerHTML = html
    keys = Object.keys(eventFunctions)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      document.querySelector(`#${key}`).addEventListener('click', eventFunctions[key])
    }

    if (currentPage < totalPages) {
      contentElement.innerHTML += nextButtonHTML
      document.querySelector('#nextButton').addEventListener('click', () => {
        jumpToPage(1)
        return false
      })
    }
  } else
    document.getElementById('content').innerHTML = '...'
}

jumpToPage(0)