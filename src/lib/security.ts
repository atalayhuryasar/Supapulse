import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

/**
 * XML/SVG metin ve attribute kaçışı.
 * Badge endpoint'i kullanıcı girdisini SVG içine gömüyor; kaçış yapılmazsa
 * `?label=` üzerinden tag/attribute injection (XSS) mümkün oluyor.
 */
const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => XML_ESCAPES[char])
}

/**
 * Badge etiketi için beyaz liste: Unicode harf/rakam, boşluk, nokta, alt çizgi, tire.
 * 32 karakterle sınırlı; boş kalırsa varsayılana döner.
 * (Türkçe karakterler korunur; XML'i bozabilecek karakterler zaten elenir.)
 */
export function sanitizeBadgeLabel(raw: string | null | undefined): string {
  const cleaned = (raw ?? '')
    .replace(/[^\p{L}\p{N} ._-]/gu, '')
    .trim()
    .slice(0, 32)
  return cleaned || 'supabase'
}

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true
  const [a, b] = parts
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) || // link-local + cloud metadata (169.254.169.254)
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) // CGNAT
  )
}

function isPrivateIPv6(ip: string): boolean {
  const value = ip.toLowerCase()
  if (value === '::' || value === '::1') return true
  if (value.startsWith('fe80') || value.startsWith('fc') || value.startsWith('fd')) return true
  const mapped = value.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  return mapped ? isPrivateIPv4(mapped[1]) : false
}

function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '')
  return (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host === 'metadata.google.internal'
  )
}

/**
 * Dışarıya yapılacak istekler (webhook) için URL doğrulaması.
 * - yalnızca https
 * - kullanıcı adı/parola yok
 * - loopback / private / link-local / metadata adresleri reddedilir
 * - alan adı çözümlenip TÜM kayıtlar kontrol edilir (DNS rebinding'e karşı
 *   kısmi koruma; istek yine hostname ile atıldığı için tam koruma değil)
 */
export async function assertPublicHttpsUrl(raw: string): Promise<URL> {
  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    throw new Error('Geçersiz webhook adresi')
  }

  if (url.protocol !== 'https:') {
    throw new Error('Webhook adresi https:// ile başlamalı')
  }
  if (url.username || url.password) {
    throw new Error('Webhook adresinde kullanıcı adı/parola olamaz')
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '')
  if (isBlockedHostname(hostname)) {
    throw new Error('Webhook adresi yerel/özel bir adrese işaret edemez')
  }

  const literal = isIP(hostname)
  if (literal === 4 && isPrivateIPv4(hostname)) {
    throw new Error('Webhook adresi özel bir IP olamaz')
  }
  if (literal === 6 && isPrivateIPv6(hostname)) {
    throw new Error('Webhook adresi özel bir IP olamaz')
  }

  if (!literal) {
    let addresses: { address: string; family: number }[]
    try {
      addresses = await lookup(hostname, { all: true, verbatim: true })
    } catch {
      throw new Error('Webhook alan adı çözümlenemedi')
    }
    if (!addresses.length) {
      throw new Error('Webhook alan adı çözümlenemedi')
    }
    for (const { address, family } of addresses) {
      const blocked = family === 4 ? isPrivateIPv4(address) : isPrivateIPv6(address)
      if (blocked) {
        throw new Error('Webhook alan adı özel bir adrese çözümleniyor')
      }
    }
  }

  return url
}
