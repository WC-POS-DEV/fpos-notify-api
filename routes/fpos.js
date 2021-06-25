const { format, set, sub } = require("date-fns");
const fs = require("fs");
const { camelKeys } = require("js-convert-case");
const { Op, QueryTypes } = require("sequelize");

const getQueryDate = () => {
  let queryDate = new Date();
  if (queryDate.getHours < 4) {
    queryDate = set(sub(queryDate, { days: 1 }), {
      hours: 4,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
  } else {
    queryDate = set(queryDate, {
      hours: 4,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
  }
  return queryDate;
};

const getRecentDate = (expiry) => {
  let queryDate = new Date();
  return sub(queryDate, { minutes: expiry });
};

const sqlFormatDate = (date) => {
  return format(date, "y-MM-dd HH:mm:ss.SSS");
};

const JSON_HEADER = ["Content-Type", "application/json; charset=utf-8"];

async function routes(fastify, opts) {
  fastify.get("/test", (req, reply) => {
    reply
      .code(200)
      .header(...JSON_HEADER)
      .send(JSON.stringify({ status: "alive" }));
  });

  // Retrieve Routes - FPOS DB
  fastify.get("/sale/check/:check/", async (req, reply) => {
    const sqlString = fs.readFileSync("./sql/SaleByCheck.sql", "utf-8");
    const results = await fastify.fpos.query(sqlString, {
      type: QueryTypes.SELECT,
      replacements: {
        checkNumber: req.params.check,
      },
    });
    if (results.length) {
      reply
        .code(200)
        .header(...JSON_HEADER)
        .send(camelKeys(JSON.stringify(results[0])));
    } else {
      reply
        .code(404)
        .header(...JSON_HEADER)
        .send(
          JSON.stringify({
            error: "Sale not found",
          })
        );
    }
  });

  fastify.get("/sale/id/:id/", async (req, reply) => {
    const sqlString = fs.readFileSync("./sql/SaleByID.sql", "utf-8");
    const results = await fastify.fpos.query(sqlString, {
      type: QueryTypes.SELECT,
      replacements: { saleID: req.params.id },
    });
    if (results.length) {
      reply
        .code(200)
        .header(...JSON_HEADER)
        .send(JSON.stringify(camelKeys(results[0])));
    } else {
      reply
        .code(404)
        .header(...JSON_HEADER)
        .send({
          error: "Sale not found",
        });
    }
  });

  fastify.get("/sale/ticket/:ticket/", async (req, reply) => {
    const sqlString = fs.readFileSync("./sql/SaleByTicket.sql", "utf-8");
    const results = await fastify.fpos.query(sqlString, {
      type: QueryTypes.SELECT,
      replacements: {
        ticketNumber: Number(req.params.ticket),
        endDate: sqlFormatDate(getQueryDate()),
      },
    });
    if (results.length) {
      reply
        .code(200)
        .header(...JSON_HEADER)
        .send(camelKeys(JSON.stringify(results[0])));
    } else {
      reply
        .code(404)
        .header(...JSON_HEADER)
        .send(
          JSON.stringify({
            error: "Sale not found",
          })
        );
    }
  });

  // List Views - FPOS DB
  fastify.get("/sales/recent/", async (req, reply) => {
    const sqlString = fs.readFileSync("./sql/RecentSales.sql", "utf-8");
    let queryDate = getRecentDate(fastify.config.RECENT_SALES_EXPIRY);
    const results = (await fastify.fpos.query(sqlString, {
      type: QueryTypes.SELECT,
      replacements: {
        endDate: sqlFormatDate(queryDate),
      },
    })).map(result => camelKeys(result));
    reply
      .code(200)
      .header(...JSON_HEADER)
      .send(JSON.stringify(results));
  });

  fastify.get("/sales/today/", async (req, reply) => {
    const sqlString = fs.readFileSync("./sql/RecentSales.sql", "utf-8");
    let queryDate = getQueryDate();
    const results = await fastify.fpos.query(sqlString, {
      type: QueryTypes.SELECT,
      replacements: {
        endDate: sqlFormatDate(queryDate),
      },
    });
    reply
      .code(200)
      .header(...JSON_HEADER)
      .send(JSON.stringify(results.maps((result) => camelKeys(result))));
  });

  fastify.get("/sale/id/:id/items/", async (req, reply) => {
    const sqlString = fs.readFileSync("./sql/SaleItemsByID.sql", "utf-8");
    const results = await fastify.fpos.query(sqlString, {
      type: QueryTypes.SELECT,
      replacements: {
        saleID: req.params.id,
      },
    });
    reply
      .code(200)
      .header(...JSON_HEADER)
      .send(JSON.stringify(results.map((result) => camelKeys(result))));
  });

  fastify.get("/board/", async (req, reply) => {
    const sqlString = fs.readFileSync("./sql/RecentSales.sql", "utf-8");
    let queryDate = getRecentDate(fastify.config.RECENT_SALES_EXPIRY);
    let sales = (await fastify.fpos.query(sqlString, {
      type: QueryTypes.SELECT,
      replacements: {
        endDate: sqlFormatDate(queryDate),
      },
    })).map(result => camelKeys(result));
    let notifications = await fastify.models.Notification.findAll({
      where: {
        [Op.and]: [
          {
            createdAt: {
              [Op.gt]: getRecentDate(fastify.config.NOTIFICATIONS_EXPIRY)
            }
          },
          { type: "BOARD" }
        ]
      },
      order: [["checkNumber", "DESC"]]
    }
    )
    let saleIds = notifications.map(notif => notif.dataValues.saleID)
    reply.code(200).header(...JSON_HEADER).send(JSON.stringify({
      inProgress: sales.filter(sale => !saleIds.includes(sale.saleId)),
      notifications
    }))
  })

  // Post Views - Notifications
  fastify.post("/notify/", async (req, reply) => {
    const sqlString = fs.readFileSync("./sql/SaleByID.sql", "utf-8");
    const results = await fastify.fpos.query(sqlString, {
      type: QueryTypes.SELECT,
      replacements: { saleID: req.body.saleId },
    });
    if (results.length) {
      let sale = camelKeys(results[0])
      let notif;
      let notifType = req.body.phoneNumber ? "PHONE" : "BOARD";
      let phone = req.body.phoneNumber ? req.body.phoneNumber.replace(/[^\d.-]/g, '') : null
      let lookupNotif = await fastify.models.Notification.findAll({where: {
        [Op.and]: [
          {
            saleId: req.body.saleId,
            type: notifType,
            phoneNumber: phone
          }
        ]
      }, limit: 1})
      if (lookupNotif.length) {
        notif = {...lookupNotif[0].dataValues, new: false}
      } else {
        if (phone) fastify.twilio.sendMessage(phone, fastify.config.MESSAGING.MESSAGES.READY.replace('{{STORE_NAME}}', fastify.config.STORE_NAME))
        notif = await fastify.models.Notification.create({
          saleID: sale.saleId,
          checkNumber: sale.checkNumber,
          ticketNumber: sale.ticketNumber,
          checkDescription: sale.checkDescription,
          type: notifType,
          phoneNumber: phone
        })
        notif = { ...notif.dataValues, new: true}
      }
      reply
        .code(200)
        .header(...JSON_HEADER)
        .send(JSON.stringify(notif));
    } else {
      reply
        .code(404)
        .header(...JSON_HEADER)
        .send(
          JSON.stringify({
            error: "Sale not found",
          })
        );
    }
  });
}

module.exports = routes;
