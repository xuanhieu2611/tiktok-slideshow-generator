import { Composio } from '@composio/core'

let _composio: Composio | null = null

export function getComposio(): Composio {
  if (!_composio) {
    const apiKey = process.env.COMPOSIO_API_KEY
    if (!apiKey) throw new Error('COMPOSIO_API_KEY is not set')
    _composio = new Composio({ apiKey })
  }
  return _composio
}

export const TIKTOK_AUTH_CONFIG_ID = 'ac_6z0cOHAAeO0L'
export const TIKTOK_TOOLKIT_VERSION = '20260307_00'
