const fp = require("fastify-plugin");

function appConfig(fastify, opts, done) {
  fastify.decorate("config", opts);
  done();
}

module.exports = fp(appConfig);
