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

async function jumpToPage(delta) {
  currentPage = Math.min(totalPages, Math.max(1, currentPage + delta))
  document.getElementById('nav-text').innerHTML = `Step ${currentPage} of ${totalPages}`
  const pageContent = document.getElementById(`page${currentPage}`)
  if (pageContent) {
    const contentElement = document.getElementById('content')
    contentElement.innerHTML = pageContent.innerHTML
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

jumpToPage(1)