/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable require-unicode-regexp */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { BlobServiceClient } from '@azure/storage-blob'
import config from 'config'
import fetch from 'node-fetch'
import sharp from 'sharp'

import { getProvider, isValidProvider } from '../avatar-providers'
import type { Lambdavatar } from '../types/lambda-avatar.types'

const IMAGE_MAX_AGE = Number.parseInt(config.get('azureStorage.image_max_age'))
const CDN: string = config.get('azureStorage.cdn')

export async function getLambdaAvatar(
  providerName: string,
  username: string
): Promise<Lambdavatar | null> {
  if (!isValidProvider(providerName)) {
    throw 'Unknown provider'
  }

  if (providerName === 'wikipedia') {
    const res = await fetch(
      `https://ideamarket.io/api/markets/wikipedia/validPageTitle?title=${username}`
    )
    if (!res.ok) {
      throw 'Invalid username'
    }

    const response = await res.json()
    username = response.data.validPageTitle
  }

  // Run a basic sanitycheck on the username
  if (providerName !== 'wikipedia' && !/^[\w()-]{1,100}$/g.test(username)) {
    throw 'Invalid username'
  }

  const lambdavatar = await getLambdaAvatarFromStorage(
    `${providerName}/${username}`
  )

  if (lambdavatar && !lambdavatar.expired) {
    return lambdavatar
  }

  let lambdavatarImage: Buffer | null | undefined
  try {
    lambdavatarImage = await getProvider(providerName)?.(username)
  } catch (error) {
    console.error(error)
  }

  if (!lambdavatarImage) {
    if (lambdavatar) {
      return lambdavatar
    }

    throw 'Could not retrieve image from provider'
  }

  try {
    lambdavatarImage = await processImage(lambdavatarImage)
  } catch (error) {
    console.log(error)
    throw 'Could not processed the picture by sharp'
  }

  const latestLambdavatar = await updateLambdaAvatarToStorage(
    `${providerName}/${username}`,
    lambdavatarImage
  )

  if (latestLambdavatar || lambdavatar) {
    return latestLambdavatar ?? lambdavatar
  }

  throw 'Could not update latest lambdavatar to storage'
}

export async function getLambdaAvatarFromStorage(
  profileId: string
): Promise<Lambdavatar | null> {
  try {
    const containerClient = getBlobStorageClient().getContainerClient('avatars')
    const properties = await containerClient
      .getBlockBlobClient(`${profileId}.png`)
      .getProperties()

    if (!properties) {
      return null
    }

    let expired = false

    if (
      properties.lastModified &&
      new Date(Date.now() - IMAGE_MAX_AGE).getTime() >
        properties.lastModified.getTime()
    ) {
      expired = true
    }

    return {
      url: `${CDN}/avatars/${encodeURIComponent(profileId)}.png`,
      expired,
    }
    // eslint-disable-next-line no-empty
  } catch {}

  return null
}

export async function updateLambdaAvatarToStorage(
  profileId: string,
  image: Buffer
): Promise<Lambdavatar | null> {
  const blobClient = getBlobStorageClient()
    .getContainerClient('avatars')
    .getBlockBlobClient(`${profileId}.png`)

  const blobOptions = { blobHTTPHeaders: { blobContentType: 'image/png' } }
  await blobClient.upload(image, image.length, blobOptions)

  return {
    url: `${CDN}/avatars/${encodeURIComponent(profileId)}.png`,
    expired: false,
  }
}

function processImage(imageData: Buffer): Promise<Buffer> {
  return sharp(imageData)
    .resize({ width: Number.parseInt(process.env.IMAGE_WIDTH as any) })
    .png()
    .toBuffer()
}

const getBlobStorageClient = (): BlobServiceClient => {
  const connectionString: string = config.get('azureStorage.connectionString')
  return BlobServiceClient.fromConnectionString(connectionString)
}
