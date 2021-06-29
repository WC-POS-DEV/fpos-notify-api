const { differenceInMinutes } = require("date-fns");
const { Op } = require("sequelize");
const JSON_HEADER = ["Content-Type", "application/json; charset=utf-8"];

async function routes(fastify, opts) {
  fastify.get("/", async (req, reply) => {
    try {
      let custWaits = await fastify.models.CustomerWait.findAll({
        order: [["status", "DESC"], ["createdAt"]],
        where: {
          status: {
            [Op.not]: "SEATED",
          },
        },
      });
      reply
        .code(200)
        .headers(...JSON_HEADER)
        .send(custWaits);
    } catch (err) {
      reply
        .code(400)
        .headers(...JSON_HEADER)
        .send({ error: err });
    }
  });

  fastify.post("/", async (req, reply) => {
    try {
      let custWait = await fastify.models.CustomerWait.create(req.body);
      fastify.twilio.sendMessage(
        custWait.phoneNumber,
        fastify.config.MESSAGING.MESSAGES.WAITLIST_ENROLL.replace(
          "{{STORE_NAME}}",
          fastify.config.STORE_NAME
        )
      );
      reply
        .code(201)
        .headers(...JSON_HEADER)
        .send(custWait);
    } catch (err) {
      reply
        .code(400)
        .headers(...JSON_HEADER)
        .send({ error: err });
    }
  });

  fastify.get("/all/", async (req, reply) => {
    try {
      let custWaits = await fastify.models.CustomerWait.findAll({
        order: [["status", "DESC"], ["createdAt"]],
      });
      reply
        .code(200)
        .headers(...JSON_HEADER)
        .send(custWaits);
    } catch (err) {
      reply
        .code(400)
        .headers(...JSON_HEADER)
        .send({ error: err });
    }
  });

  fastify.get("/:id/", async (req, reply) => {
    let custWait = await fastify.models.CustomerWait.findByPk(req.params.id);
    if (custWait) {
      reply
        .code(200)
        .headers(...JSON_HEADER)
        .send(custWait);
    } else {
      reply
        .code(200)
        .headers(...JSON_HEADER)
        .send({ error: "Customer wait object not found." });
    }
  });

  fastify.put("/:id/", async (req, reply) => {
    let custWait = await fastify.models.CustomerWait.findByPk(req.params.id);
    if (custWait) {
      Object.keys(req.body).forEach((key) => {
        if (custWait[key] !== undefined) custWait[key] = req.body[key];
      });
      await custWait.save();
      reply
        .code(200)
        .headers(...JSON_HEADER)
        .send(custWait);
    } else {
      reply
        .code(200)
        .headers(...JSON_HEADER)
        .send({ error: "Customer wait object not found." });
    }
  });

  fastify.delete("/:id/", async (req, reply) => {
    let custWait = await fastify.models.CustomerWait.findByPk(req.params.id);
    if (custWait) {
      await custWait.destroy();
      reply.code(204).send();
    } else {
      reply
        .code(200)
        .headers(...JSON_HEADER)
        .send({ error: "Customer wait object not found." });
    }
  });

  fastify.post("/message/", async (req, reply) => {
    let custWait = await fastify.models.CustomerWait.findByPk(req.body.id);
    if (custWait) {
      fastify.twilio.sendMessage(
        custWait.phoneNumber,
        fastify.config.MESSAGING.MESSAGES.WAITLIST_READY.replace(
          "{{STORE_NAME}}",
          fastify.config.STORE_NAME
        )
      );
      custWait.status = "MESSAGED";
      custWait.messageTime = new Date();
      await custWait.save();
      reply
        .code(200)
        .headers(...JSON_HEADER)
        .send(custWait);
    } else {
      reply
        .code(200)
        .headers(...JSON_HEADER)
        .send({ error: "Customer wait object not found." });
    }
  });

  fastify.post("/seat/", async (req, reply) => {
    let custWait = await fastify.models.CustomerWait.findByPk(req.body.id);
    if (custWait) {
      custWait.status = "SEATED";
      custWait.seatedTime = new Date();
      custWait.waitTime = differenceInMinutes(
        custWait.seatedTime,
        custWait.createdAt
      );
      await custWait.save();
      reply
        .code(200)
        .headers(...JSON_HEADER)
        .send(custWait);
    } else {
      reply
        .code(200)
        .headers(...JSON_HEADER)
        .send({ error: "Customer wait object not found." });
    }
  });
}

module.exports = routes;
