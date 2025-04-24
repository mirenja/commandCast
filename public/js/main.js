

document.addEventListener('DOMContentLoaded', function (){
    console.log('main.js is loaded!')
    const offlineClientDivs = document.querySelectorAll(".client-card")
    offlineClientDivs.forEach((div) => {
        div.addEventListener('click', async function() {
            const clientId = div.getAttribute('client_id')
            const ip_address = div.getAttribute('client_ip_address')
            const statusElement = div.querySelector('.client_status')
            const status = statusElement?.textContent.trim()

            const endpoint = status === 'online' ? '/disconnect' : '/connect'

            const bodyData = JSON.stringify({
                _id: clientId,
                ip_address
            })
            console.log("Sending this body to /connect:", bodyData)
            try {
                const response = await fetch(endpoint , {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body:bodyData
                })
            
                const result = await response.json()
                console.log(result)
                if (result.success) {
                     statusElement.textContent = endpoint === '/disconnect' ? 'offline' : 'online'
                     //window.location.reload()
                  }
    
            } catch (error) {
                console.error('Error connecting to client:', error)
            }
        })
        })
})