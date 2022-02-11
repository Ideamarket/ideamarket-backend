#!/usr/bin/env node
const http = require('http')

console.log('DEVWeb3ToWeb2 webjob started...')
const options = {
  host: 'server-dev.ideamarket.io',
  port: 80,
  path: '/listing/onchain',
  method: 'PATCH',
}

console.log('Copying web3 data of all onchain listings to web2')
http
  .request(options, (res) => {
    console.log(`Headers: ${JSON.stringify(res.headers)}`)
    console.log(`Status: ${res.statusCode}`)
    res.setEncoding('utf8')
    res.on('data', (chunk) => {
      console.log(`Response: ${chunk}`)
      process.exit(0)
    })
    res.on('error', (e) => {
      console.log(`Error: ${e}`)
      process.exit(1)
    })
  })
  .end()
