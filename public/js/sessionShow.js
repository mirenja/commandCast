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