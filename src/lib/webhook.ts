export interface AlertPayload {
  webhookUrl: string
  projectName: string
  projectUrl?: string
  statusCode?: number | null
  message?: string | null
  timestamp?: string
}

/**
 * Sends an automated failure notification to a user's Discord, Slack, or generic webhook.
 */
export async function sendFailureAlert({
  webhookUrl,
  projectName,
  projectUrl,
  statusCode,
  message,
  timestamp = new Date().toISOString(),
}: AlertPayload): Promise<{ success: boolean; error?: string }> {
  if (!webhookUrl || !webhookUrl.trim()) {
    return { success: false, error: 'Webhook URL is missing' }
  }

  const cleanUrl = webhookUrl.trim()
  const isDiscord = cleanUrl.includes('discord.com/api/webhooks')
  const isSlack = cleanUrl.includes('hooks.slack.com')

  let payload: Record<string, unknown>

  if (isDiscord) {
    payload = {
      username: 'Supapulse Pulse Alert',
      avatar_url: 'https://raw.githubusercontent.com/atalayhuryasar/Supapulse/main/public/logo.svg',
      embeds: [
        {
          title: '🚨 Supapulse Alert: Pulse Failed',
          description: `Database heartbeat failed for project **${projectName}**.`,
          color: 15158332, // Red #E74C3C
          fields: [
            {
              name: 'Status Code',
              value: statusCode ? `${statusCode}` : 'Connection Timeout / 0',
              inline: true,
            },
            {
              name: 'Project URL',
              value: projectUrl ? projectUrl : 'N/A',
              inline: true,
            },
            {
              name: 'Error Details',
              value: message || 'Failed to ping project database endpoints.',
              inline: false,
            },
          ],
          footer: {
            text: 'Supapulse Keep-Alive Engine',
          },
          timestamp,
        },
      ],
    }
  } else if (isSlack) {
    payload = {
      text: `🚨 *Supapulse Alert:* Heartbeat failed for *${projectName}* (Code: ${statusCode || 'Timeout'}) — _${message || 'Could not connect'}_`,
    }
  } else {
    // Generic webhook payload
    payload = {
      event: 'ping_failed',
      project: {
        name: projectName,
        url: projectUrl,
      },
      error: {
        statusCode: statusCode || 0,
        message: message || 'Failed to ping project database endpoints',
      },
      timestamp,
    }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)

    const res = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      return { success: false, error: `Webhook responded with HTTP ${res.status}` }
    }

    return { success: true }
  } catch (err: unknown) {
    const error = err as Error
    return { success: false, error: error.message || 'Webhook request failed' }
  }
}

/**
 * Sends a test notification to verify that the webhook is valid and functioning properly.
 */
export async function sendTestWebhook(
  webhookUrl: string,
  projectName: string
): Promise<{ success: boolean; error?: string }> {
  if (!webhookUrl || !webhookUrl.trim()) {
    return { success: false, error: 'Webhook URL is required' }
  }

  const cleanUrl = webhookUrl.trim()
  const isDiscord = cleanUrl.includes('discord.com/api/webhooks')
  const isSlack = cleanUrl.includes('hooks.slack.com')

  let payload: Record<string, unknown>

  if (isDiscord) {
    payload = {
      username: 'Supapulse Monitor',
      avatar_url: 'https://raw.githubusercontent.com/atalayhuryasar/Supapulse/main/public/logo.svg',
      embeds: [
        {
          title: '✅ Supapulse Webhook Connected!',
          description: `Test alert successfully received for project **${projectName}**. You will receive instant notifications here if any heartbeat pulse fails.`,
          color: 4116366, // Supabase emerald #3ECF8E
          footer: {
            text: 'Supapulse Keep-Alive Engine',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    }
  } else if (isSlack) {
    payload = {
      text: `✅ *Supapulse Webhook Connected:* Test alert verified for project *${projectName}*.`,
    }
  } else {
    payload = {
      event: 'test_webhook',
      status: 'connected',
      project: { name: projectName },
      timestamp: new Date().toISOString(),
    }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)

    const res = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      return { success: false, error: `Webhook responded with HTTP ${res.status}` }
    }

    return { success: true }
  } catch (err: unknown) {
    const error = err as Error
    return { success: false, error: error.message || 'Failed to reach webhook URL' }
  }
}
