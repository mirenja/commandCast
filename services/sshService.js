import { Client } from 'ssh2';
import fs from 'fs'
import {PRIVATE_KEY_PATH} from '../config/app.js'

export function connectAndExecute({ host, username, privateKeyPath, command }) {
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
        ip_address,
        port: 22,
        jill,
        privateKey: fs.readFileSync(PRIVATE_KEY_PATH)
      })
    })
  }