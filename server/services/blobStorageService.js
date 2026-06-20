import { BlobServiceClient } from '@azure/storage-blob'
import { randomUUID } from 'crypto'

const getClient = () =>
  BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING)

/**
 * Upload an image buffer to Azure Blob Storage.
 * @param {string} userId
 * @param {Buffer} buffer
 * @param {string} mimeType - e.g. 'image/jpeg'
 * @returns {Promise<string>} public blob URL
 */
export const uploadImage = async (userId, buffer, mimeType) => {
  const ext = mimeType.split('/')[1] || 'jpg'
  const blobName = `${userId}/${randomUUID()}.${ext}`
  const containerClient = getClient().getContainerClient(
    process.env.AZURE_STORAGE_CONTAINER_NAME
  )
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)
  await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: { blobContentType: mimeType },
  })
  return blockBlobClient.url
}

/**
 * Delete a blob from Azure Blob Storage by its public URL.
 * @param {string} blobUrl
 */
export const deleteImage = async (blobUrl) => {
  const url = new URL(blobUrl)
  const pathParts = url.pathname.split('/')
  const containerName = pathParts[1]
  const blobName = pathParts.slice(2).join('/')
  const containerClient = getClient().getContainerClient(containerName)
  await containerClient.getBlockBlobClient(blobName).deleteIfExists()
}
