import crypto from 'crypto'
import User from '../models/User.js'

const FREE_SCAN_LIMIT = 3

/**
 * Verifies the Lemon Squeezy HMAC SHA256 webhook signature.
 */
const verifyWebhookSignature = (rawBody, signature, secret) => {
  if (!signature || !secret || !rawBody) return false
  try {
    const hmac = crypto.createHmac('sha256', secret)
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8')
    const checksum = Buffer.from(signature, 'utf8')
    return digest.length === checksum.length && crypto.timingSafeEqual(digest, checksum)
  } catch (err) {
    console.error('[Billing] Signature verification error:', err)
    return false
  }
}

/**
 * POST /api/billing/webhook
 * Receives and processes events from Lemon Squeezy.
 */
export const handleWebhook = async (req, res) => {
  try {
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET
    const signature = req.headers['x-signature']

    // If webhook secret is configured, enforce strict signature verification
    if (secret) {
      const isValid = verifyWebhookSignature(req.rawBody, signature, secret)
      if (!isValid) {
        console.warn('[Billing] Webhook rejected: Invalid signature.')
        return res.status(401).json({ success: false, error: 'Invalid webhook signature' })
      }
    } else {
      console.warn('[Billing] Warning: LEMON_SQUEEZY_WEBHOOK_SECRET not set in .env. Skipping signature verification in dev mode.')
    }

    const event = req.body
    if (!event || !event.meta || !event.data) {
      return res.status(400).json({ success: false, error: 'Malformed webhook payload' })
    }

    const eventName = event.meta.event_name
    const customData = event.meta.custom_data || {}
    const dataAttributes = event.data.attributes || {}
    const subscriptionId = String(event.data.id || '')
    const customerId = String(dataAttributes.customer_id || '')
    const variantId = String(dataAttributes.variant_id || '')
    const orderId = String(dataAttributes.order_id || '')

    // Resolve user by custom_data.user_id first, then fallback to email matching
    let user = null
    if (customData.user_id) {
      user = await User.findById(customData.user_id)
    }

    const customerEmail = (dataAttributes.user_email || dataAttributes.customer_email || '').toLowerCase().trim()
    if (!user && customerEmail) {
      user = await User.findOne({ email: customerEmail })
    }

    if (!user && subscriptionId) {
      user = await User.findOne({ subscriptionId })
    }

    console.log(`[Billing] Received event: ${eventName} for ${customerEmail || user?._id || 'unknown user'}`)

    const renewsAt = dataAttributes.renews_at ? new Date(dataAttributes.renews_at) : null
    const endsAt = dataAttributes.ends_at ? new Date(dataAttributes.ends_at) : null
    const status = dataAttributes.status

    if (!user) {
      if (customerEmail && (eventName === 'subscription_created' || eventName === 'subscription_resumed' || eventName === 'order_created')) {
        const name = dataAttributes.user_name || dataAttributes.customer_name || customerEmail.split('@')[0]
        user = new User({
          name,
          email: customerEmail,
          subscriptionStatus: 'active',
          subscriptionId: subscriptionId || null,
          customerId: customerId || null,
          variantId: variantId || null,
          orderId: orderId || null,
          renewsAt,
          endsAt,
        })
        await user.save()
        console.log(`[Billing] Auto-created new PRO user ${customerEmail} from ${eventName}.`)
        return res.status(200).json({ success: true, message: 'New user created with active subscription' })
      } else {
        console.warn(`[Billing] User not found for webhook event: ${eventName}. Skipping DB update.`)
        // Return 200 so Lemon Squeezy does not continuously retry if user was deleted
        return res.status(200).json({ success: true, message: 'Event received, user not matched' })
      }
    }

    switch (eventName) {
      case 'subscription_created':
      case 'subscription_resumed':
      case 'order_created': {
        user.subscriptionStatus = 'active'
        if (subscriptionId) user.subscriptionId = subscriptionId
        if (customerId) user.customerId = customerId
        if (variantId) user.variantId = variantId
        if (orderId) user.orderId = orderId
        if (renewsAt) user.renewsAt = renewsAt
        if (endsAt) user.endsAt = endsAt
        await user.save()
        console.log(`[Billing] User ${user.email} upgraded to PRO (status: active).`)
        break
      }

      case 'subscription_updated': {
        if (status === 'active') {
          user.subscriptionStatus = 'active'
        } else if (status === 'past_due') {
          user.subscriptionStatus = 'past_due'
        } else if (status === 'cancelled') {
          user.subscriptionStatus = 'cancelled'
        } else if (status === 'expired') {
          user.subscriptionStatus = 'expired'
        }
        if (renewsAt) user.renewsAt = renewsAt
        if (endsAt) user.endsAt = endsAt
        await user.save()
        console.log(`[Billing] User ${user.email} subscription updated to ${user.subscriptionStatus}.`)
        break
      }

      case 'subscription_cancelled': {
        // Keeps active until endsAt, but flags cancellation
        user.subscriptionStatus = 'cancelled'
        if (endsAt) user.endsAt = endsAt
        await user.save()
        console.log(`[Billing] User ${user.email} cancelled subscription. Ends at: ${endsAt}`)
        break
      }

      case 'subscription_expired': {
        user.subscriptionStatus = 'expired'
        await user.save()
        console.log(`[Billing] User ${user.email} subscription expired. Downgraded to free.`)
        break
      }

      default:
        console.log(`[Billing] Unhandled event: ${eventName}`)
    }

    return res.status(200).json({ success: true, message: 'Webhook processed successfully' })
  } catch (err) {
    console.error('[Billing] Fatal error in webhook processor:', err)
    return res.status(500).json({ success: false, error: 'Internal webhook error' })
  }
}

/**
 * GET /api/billing/status
 * Returns subscription tier and scan usage for the current user.
 */
export const getBillingStatus = async (req, res) => {
  try {
    const user = req.user
    const checkoutUrl =
      process.env.LEMON_SQUEEZY_CHECKOUT_URL ||
      'https://labellens.lemonsqueezy.com/checkout/buy/c8808b7d-5797-4fc6-a14e-ae0c82bcf502'

    if (!user) {
      return res.json({
        success: true,
        data: {
          isPro: false,
          subscriptionStatus: 'free',
          scansCount: 0,
          freeScansLimit: FREE_SCAN_LIMIT,
          scansRemaining: FREE_SCAN_LIMIT,
          checkoutUrl,
        },
      })
    }

    const isPro = user.subscriptionStatus === 'active'
    const scansCount = Number(user.scansCount) || 0
    const scansRemaining = isPro ? Infinity : Math.max(0, FREE_SCAN_LIMIT - scansCount)

    return res.json({
      success: true,
      data: {
        isPro,
        subscriptionStatus: user.subscriptionStatus || 'free',
        scansCount,
        freeScansLimit: FREE_SCAN_LIMIT,
        scansRemaining,
        renewsAt: user.renewsAt,
        endsAt: user.endsAt,
        checkoutUrl,
      },
    })
  } catch (err) {
    console.error('[Billing] Error fetching billing status:', err)
    return res.status(500).json({ success: false, error: 'Failed to fetch billing status' })
  }
}
