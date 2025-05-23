import { headers } from 'next/headers'

export async function getBaseUrlFromHeaders() {
  const header = await headers()
  const host = header.get('host')
  const protocolHeader = header.get('x-forwarded-proto')
  const protocol = protocolHeader || 'http'
  return `${protocol}://${host}`
}
export function getBaseUrl() {
  const host = process.env.HOST || 'localhost'
  const port = process.env.PORT || '3000'
  const protocol = 'http'
  return `${protocol}://${host}:${port}`
}
