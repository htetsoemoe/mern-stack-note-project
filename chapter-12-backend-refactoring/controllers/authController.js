const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// @desc Login
// @route POST /auth
// @access Public
const login = async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required!' })
    }

    const foundUser = await User.findOne({ username }).exec()

    if (!foundUser || !foundUser.active) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const matchPassword = await bcrypt.compare(password, foundUser.password)

    if (!matchPassword) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    // Generate accessToken using ACCESS_TOKEN_SECRET
    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "roles": foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1m' }
    )

    // Generate refreshToken using REFRESH_TOKEN_SECRET
    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '3m' }
    )

    // Create secure cookie with refresh token
    res.cookie('jwt', refreshToken, {
        httpOnly: true, // accessible only by web server
        secure: true, // https
        sameSite: 'None', // cross-site cookie
        maxAge: 7 * 24 * 60 * 60 * 1000 // cookie expiry: set to match RefreshToken
    })

    // send accessToken containing username and roles
    res.json({ accessToken })

}

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const refreshToken = cookies.jwt

    // Verify 'refreshToken' and re-generate 'accessToken'
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Forbidden' })
            }

            // Search 'User' using decoded username from 'refreshToken'
            const foundUser = await User.findOne({ username: decoded.username }).exec()

            if (!foundUser) {
                return res.status(401).json({ message: 'Unauthorized' })
            }

            // Re-generate 'accessToken'
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "roles": foundUser.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1m' }
            )

            res.json({ accessToken })
        })
    )
}

// @desc Login
// @route POST /auth
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) {
        return res.sendStatus(204) // No Content
    }

    res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'None',
        secure: true
    })

    res.json({ message: 'Cookie Cleared! Logout' })
}

module.exports = {
    login,
    refresh,
    logout
}