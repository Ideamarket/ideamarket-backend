#!/usr/bin/env node
const http = require('http')

console.log('DEVOnchainListingsTrigger webjob started...')

const postData = JSON.stringify({
  type: 'ONCHAIN_LISTING',
})
const options = {
  host: 'server-dev.ideamarket.io',
  port: 80,
  path: '/trigger/resolve',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
  },
}

console.log('Resolving onchain_listing triggers')
const req = http.request(options, (res) => {
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
req.write(postData)
req.end()
