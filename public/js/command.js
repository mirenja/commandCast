
  
  async function sendCommand() {
    const raw = document.getElementById('clientData').textContent
    const clients = JSON.parse(raw)
    //const onlineClients = clients.filter(client => client.status === 'online') ///actual app
    //dev server

    const onlineClients = clients.filter(client => client.name === 'testpc')

    console.log("online clients only-------")
    console.log(onlineClients)

    const command = document.getElementById('commandInput').value
  
    if (!command) {
      alert("Please enter a command!")
      return
    }

    try {
        
        for (const client of onlineClients) {
            console.log('------------------------------client receiving command')
            console.log(client)
            const clientId = client._id.toString()
            const bodyData = JSON.stringify({ _id: clientId, command })
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


        }
      } catch (error) {
        console.error("Error sending command:", error)
      }

  }