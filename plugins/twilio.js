const fp = require("fastify-plugin")

async function configureTwilio(fastify, opts, done) {
    if (!fastify.config) done();
    const client = require('twilio')(fastify.config.MESSAGING.ACCOUNT_SID, fastify.config.MESSAGING.AUTH_TOKEN)
    const sendMessage = async (to, body) => {
        try {
            let message = await client.messages.create({
                body,
                to,
                from: fastify.config.MESSAGING.FROM
            })
            return message
        } catch (err) {
            console.log(err)
            return null
        }
    }
    const formatMessage = (text, replacements) => {
        Object.keys(replacements).forEach(key => text.replace(key, replacements[key]))
        return text
    }
    fastify.decorate("twilio", {
        client,
        sendMessage,
        formatMessage
    })
    done()
}

module.exports = fp(configureTwilio)