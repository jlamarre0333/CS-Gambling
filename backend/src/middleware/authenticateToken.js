const jwt = require('jsonwebtoken')

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No token provided.' 
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid token.' 
    })
  }
}

module.exports = authenticateToken 