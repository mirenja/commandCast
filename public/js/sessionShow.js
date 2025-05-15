document.addEventListener('DOMContentLoaded', () => {
    const rows = document.querySelectorAll('tbody tr')
  
    rows.forEach(row => {
      row.addEventListener('click', () => {
        const sessionId = row.getAttribute('data-session-id')
        if (sessionId) {
          window.location.href = `/sessions/${sessionId}`
        }
      })
    })
  })


  document.getElementById('searchButton').addEventListener('click', function(e) {
    e.preventDefault()
    console.log("search is clicked")

    let searchValue = document.getElementById('sessionSearchInput').value.trim()
    console.log("searched value--------",searchValue)
    
    if (searchValue.toLowerCase().startsWith('session-')) {
        searchValue = searchValue.slice(8)
      }

      const searchUrl = `/sessions?search=${encodeURIComponent(searchValue)}` 
      fetch(searchUrl, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest', 
          'Accept': 'text/html'
        }
      })
        .then(response => response.text())
        .then(data => {
          document.getElementById('sessionContent').innerHTML = data 
        })
        .catch(error => {
          console.error('search Error:', error) 
        }) 
    })