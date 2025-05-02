document.getElementById('searchButton').addEventListener('click', function(e) {
    e.preventDefault()

    const searchValue = document.getElementById('sessionSearchInput').value.trim()
    
    if (searchValue.toLowerCase().startsWith('session-')) {
        searchValue = searchValue.slice(8)
      }

    const searchUrl = `/sessions?search=${encodeURIComponent(searchValue)}`
    fetch(searchUrl)
      .then(response => response.text())
      .then(data => {
        
        document.getElementById('sessionContent').innerHTML = data 
      })
      .catch(error => {
        console.error('search Error:', error) 
      }) 
  }) 
  