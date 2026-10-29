import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { escapeXml, sanitizeBadgeLabel } from '@/lib/security'

export const dynamic = 'force-dynamic'

// Badge bir görsel; içinde script çalışmasına gerek yok.
const BADGE_HEADERS = {
  'Content-Type': 'image/svg+xml; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
}

// Durum rozeti "şu an ayakta mı?" sinyali: 60s cache, ping sonrası bayat
// cevap döndürüyordu. 15s, CDN korumasını korurken gecikmeyi kabaca insan
// ölçeğine indirir. stale-while-revalidate bilinçli olarak yok — bayat
// cevabın ne kadar süre servis edileceğini belirsizleştiriyordu.
const BADGE_CACHE_CONTROL = 'public, max-age=15, s-maxage=15'
const BADGE_NO_STORE = 'no-cache, no-store, must-revalidate'

function generateBadgeSvg({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: string
}) {
  // Approximate text widths for standard SVG rendering
  const charWidth = 6.8
  const pad = 10
  const labelWidth = Math.round(label.length * charWidth + pad * 2)
  const valueWidth = Math.round(value.length * charWidth + pad * 2)
  const totalWidth = labelWidth + valueWidth
  const height = 20

  const labelTextX = Math.round(labelWidth / 2)
  const valueTextX = Math.round(labelWidth + valueWidth / 2)
  const safeLabel = escapeXml(label)
  const safeValue = escapeXml(value)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" role="img" aria-label="${safeLabel}: ${safeValue}">
  <title>${safeLabel}: ${safeValue}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".12"/>
    <stop offset="1" stop-opacity=".12"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="${height}" rx="3.5" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="${height}" fill="#21262d"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="${height}" fill="${color}"/>
    <rect width="${totalWidth}" height="${height}" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" text-rendering="geometricPrecision" font-size="110">
    <text aria-hidden="true" x="${labelTextX * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(labelWidth - pad * 2) * 10}">${safeLabel}</text>
    <text x="${labelTextX * 10}" y="140" transform="scale(.1)" fill="#c9d1d9" textLength="${(labelWidth - pad * 2) * 10}">${safeLabel}</text>
    <text aria-hidden="true" x="${valueTextX * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" font-weight="bold" textLength="${(valueWidth - pad * 2) * 10}">${safeValue}</text>
    <text x="${valueTextX * 10}" y="140" transform="scale(.1)" fill="#ffffff" font-weight="bold" textLength="${(valueWidth - pad * 2) * 10}">${safeValue}</text>
  </g>
</svg>`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const customLabel = sanitizeBadgeLabel(searchParams.get('label'))

  try {
    const supabase = createAdminClient()
    const { data: project, error } = await supabase
      .from('projects')
      .select('id, name, is_active, last_ping_status, last_ping_code')
      .eq('id', id)
      .single()

    if (error || !project) {
      const svg = generateBadgeSvg({
        label: customLabel,
        value: 'not found',
        color: '#6e7681',
      })
      return new Response(svg, {
        headers: { ...BADGE_HEADERS, 'Cache-Control': BADGE_NO_STORE },
      })
    }

    let value = 'unknown'
    let color = '#6e7681' // muted gray

    if (!project.is_active) {
      value = 'paused'
      color = '#d29922' // yellow/orange
    } else if (project.last_ping_status === 'success') {
      value = 'awake'
      color = '#3ecf8e' // Supabase Emerald
    } else if (project.last_ping_status === 'failed') {
      value = 'failing'
      color = '#f85149' // Red
    } else {
      value = 'pending'
      color = '#d29922'
    }

    const svg = generateBadgeSvg({
      label: customLabel,
      value,
      color,
    })

    return new Response(svg, {
      headers: {
        ...BADGE_HEADERS,
        'Cache-Control': BADGE_CACHE_CONTROL,
      },
    })
  } catch (err: unknown) {
    const svg = generateBadgeSvg({
      label: customLabel,
      value: 'error',
      color: '#f85149',
    })
    return new Response(svg, {
      headers: { ...BADGE_HEADERS, 'Cache-Control': BADGE_NO_STORE },
    })
  }
}
