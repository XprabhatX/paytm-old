import jwt from 'jsonwebtoken'
import 'dotenv/config'

function authMiddleware (req, res) {
    const header = req.headers.authorization

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(403).json({})
    }

    const token = header.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.userId = decoded.userId

        next()
    } catch (err) {
        return res.status(403).json()
    }
}

export default authMiddleware