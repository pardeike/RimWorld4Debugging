var currentPage = 0
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

var pageSecondTickTimer = null

async function jumpToPage(delta) {
  if (currentPage == 0) {
    // initial page loading
    currentPage = await getPreference('currentPage', 1)
    loadSetting()
  }
  if (pageSecondTickTimer)
    clearInterval(pageSecondTickTimer)
  pageSecondTickTimer = setInterval(async () => {
    const shouldReloadFunc = pageSecondTick[currentPage]
    if (shouldReloadFunc && await shouldReloadFunc()) {
      jumpToPage(0)
      return
    }
  }, 1000)
  const spinnerTimer = setTimeout(() => {
    document.getElementById('spinner').style.display = 'grid'
  }, 100)
  currentPage = Math.min(totalPages, Math.max(1, currentPage + delta))
  await setPreference('currentPage', currentPage)
  document.getElementById('nav-text').innerHTML = `Step ${currentPage} of ${totalPages}`
  const pageContent = document.getElementById(`page${currentPage}`)
  if (pageContent) {
    var html = pageContent.innerHTML
    const contentElement = document.getElementById('content')

    const pageFilter = pageFilters[currentPage]
    if (pageFilter)
      html = await pageFilter(html)

    while (true) {
      var keys = Object.keys(pageConditions)
      var found = false
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (html.match(new RegExp(`:${key}`))) {
          const show = await pageConditions[key]()
          const oldHtml = html
          if (show)
            html = html.replace(new RegExp(`<!-- *ELSE:${key} *-->.+<!-- *ENDELSE:${key} *-->`, 'smg'), '')
          else
            html = html.replace(new RegExp(`<!-- *IF:${key} *-->.+<!-- *ENDIF:${key} *-->`, 'smg'), '')
          found = oldHtml != html
        }
      }
      if (!found) break
    }

    keys = Object.keys(pageValues)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      if (html.match(new RegExp(`VAL:${key}`))) {
        const value = await pageValues[key]()
        html = html.replace(new RegExp(`"VAL:${key}"`, 'smg'), value)
        html = html.replace(new RegExp(`<!-- *VAL:${key} *-->`, 'smg'), value)
      }
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
    setTimeout(() => {
      keys = Object.keys(eventFunctions)
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        document.getElementById(key).addEventListener('click', eventFunctions[key])
      }
    }, 500)

    clearTimeout(spinnerTimer)
    document.getElementById('spinner').style.display = 'none'

    if (currentPage < totalPages && (!pageContinuation[currentPage] || await pageContinuation[currentPage]())) {
      contentElement.innerHTML += nextButtonHTML
      document.getElementById('nextButton').addEventListener('click', () => {
        jumpToPage(1)
        return false
      })
    }
  } else
    document.getElementById('content').innerHTML = '...'
}

jumpToPage(0)
setProgress(-1)