#!/usr/bin/env node
/* eslint-disable promise/prefer-await-to-then */
/* eslint-disable no-promise-executor-return */
/* eslint-disable unicorn/numeric-separators-style */
const http = require('http')

const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs))

main()

function main() {
  console.log('Starting the webjob...')
  const options = {
    host: 'server-dev.ideamarket.io',
    port: 80,
    path: '/opinion/nft',
    method: 'PATCH',
  }
  console.log('Waiting for 10 seconds...')
  sleep(10000).then(() => {
    console.log('Copying NFT opinions from web3 to web2')
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
  })
}
