import jwt from 'jsonwebtoken'

export const signToken = (userId) => {
  const secret = process.env.JWT_SECRET
  const expires = process.env.JWT_EXPIRES_IN || '7d'
  return jwt.sign({ sub: userId }, secret, { expiresIn: expires })
}

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}
