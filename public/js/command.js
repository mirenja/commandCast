
  
  async function sendCommand() {
    console.log("command.js has been called!!!")
    // const raw = document.getElementById('clientData').textContent
    
    //const onlineClients = clients.filter(client => client.status === 'online') ///actual app
    //dev server




   

    const command = document.getElementById('commandInput').value
    const category = document.getElementById('categorySelect').value
  
    if (!command) {
      alert("Please enter a command!")
      return
    }

    try {
        
            const bodyData = JSON.stringify({ command ,category})
            //console.log(bodyData)

          const res = await fetch('/sendCommand', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: bodyData
          })
    
          const result = await res.json()
          console.log('command sent------') 

         if (result.success) {
            document.getElementById('commandresult').textContent = result.message
         } else {
            
            document.getElementById('commandresult').textContent = result.error
           
         }


        
      } catch (error) {
        console.error("Error sending command:", error)
      }

  }


async function clearResults() {
  const resultsContainer = document.getElementById('commandresult')
  resultsContainer.innerHTML = ''
}