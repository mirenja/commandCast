import { Client } from 'ssh2';
import fs from 'fs'


export function connectAndExecute({ host,SSH_PASS, command }) {
    return new Promise((resolve, reject) => {
      const conn = new Client()
      let output = ''
  
      conn.on('ready', () => {
        conn.exec(command, (err, stream) => {
          if (err) {
            conn.end()
            return reject(new Error('SSH exec error: ' + err.message))
          }
  
          stream.on('data', data => output += data.toString());
          stream.stderr.on('data', data => output += 'ERROR: ' + data.toString())
  
          stream.on('close', () => {
            conn.end()
            resolve(output.trim())
          })
        })
      }).on('error', (err) => {
        reject(new Error('SSH connection error: ' + err.message))
      }).connect({
        host,
        port: 22,
        username:"jill",
        password:'Peach1!'

      })
    })
  }