import { Client } from 'ssh2'

export function connect({ host, username, password }) {
    return new Promise((resolve, reject) => {
        const conn = new Client()
        
        conn.on('ready', () => {
            resolve(conn)  
        }).on('error', (err) => {
            reject(new Error('SSH connection error: ' + err.message))
        }).connect({
            host,
            port: 22,
            username,
            password
        })
    })
}


export function sendCommand(conn, command) {
    return new Promise((resolve, reject) => {
      let output = ''
  
      conn.exec(command, (err, stream) => {
        if (err) return reject(new Error('SSH exec error: ' + err.message))
  
        stream.on('data', (data) => {
          output += data.toString();
        });
  
        stream.stderr.on('data', (data) => {
          output += 'ERROR: ' + data.toString()
        })
  
        stream.on('close', () => {
          conn.end()
          resolve(output.trim())
        })
      })
    })
  }