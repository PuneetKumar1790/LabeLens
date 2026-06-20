import 'dotenv/config'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { signToken } from '../services/jwtService.js'
import User from '../models/User.js'

// Configure Google OAuth Strategy (side-effect: registers it on first import)
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value
        if (!email) return done(new Error('No email from Google'))

        let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] })

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            avatar: profile.photos?.[0]?.value || '',
            authProvider: 'google',
            googleId: profile.id,
          })
        } else if (!user.googleId) {
          user.googleId = profile.id
          user.avatar = profile.photos?.[0]?.value || user.avatar
          await user.save()
        }

        done(null, user)
      } catch (err) {
        done(err)
      }
    }
  )
)

export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
})

export const googleCallback = [
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_failed`,
  }),
  (req, res) => {
    const token = signToken(req.user._id.toString())
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    res.redirect(`${clientUrl}/auth/callback?token=${token}`)
  },
]

export const getMe = async (req, res) => {
  res.json({ success: true, data: req.user })
}

export const logout = (_req, res) => {
  res.json({ success: true, message: 'Logged out' })
}
