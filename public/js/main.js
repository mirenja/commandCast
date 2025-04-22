

document.addEventListener('DOMContentLoaded', function (){
    console.log('main.js is loaded!')
    const offlineClientDivs = document.querySelectorAll(".client-card")
    offlineClientDivs.forEach((div) => {
        div.addEventListener('click', async function() {
            const clientId = div.getAttribute('client-id')
            const ip_address = div.getAttribute('client_ip_address')
            const bodyData = JSON.stringify({
                id: clientId,
                ip_address
            })
            console.log("Sending this body to /connect:", bodyData)
            try {
                const response = await fetch('/connect', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body:bodyData
                })
            
                const result = await response.json()
                console.log(result)
    
            } catch (error) {
                console.error('Error connecting to client:', error)
            }
        })
        })
})