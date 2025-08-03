import jwt from 'jsonwebtoken'

const generatedAccessToken = async (userId) => {
    const token = await jwt.sign(
        { id: userId },
        process.env.SECRET_KEY_ACCESS_TOKEN,
        { expiresIn: '24h' }
    )

    return token
}

export default generatedAccessToken