const fs = require("fs");
const path = require("path");

const app = require("fastify")({ logger: true });
const fastifyCors = require("fastify-cors")
const chalk = require("chalk");
const fsequelize = require("sequelize-fastify");
const ora = require("ora");
const { resolve } = require("path");

let config;
let loggingFunc;
let logStream;
const configPath = path.join(__dirname, "config.json");
if (fs.existsSync(configPath)) config = JSON.parse(fs.readFileSync(configPath));

if (config) {
  if (config.DEBUG && config.LOG_FILENAME) {
    let logPath = path.join(__dirname, "log", path.sep, config.LOG_FILENAME);
    fs.mkdirSync(path.basename(path.dirname(logPath)), { recursive: true });
    logStream = fs.createWriteStream(logPath, { flags: "a" });
    loggingFunc = (msg) => logStream.write(msg + "\n");
  } else if (config.DEBUG) {
    loggingFunc = console.log;
  } else {
    loggingFunc = false;
  }
} else {
  loggingFunc = console.log;
}

const sequelizeConfig = {
  instance: "db",
  sequelizeOptions: {
    autoConnect: true,
    dialect: "sqlite",
    storage: resolve(__dirname, "data.sqlite"),
    logging: loggingFunc,
  },
};

const fposConfig = {
  instance: "fpos",
  sequelizeOptions: {
    database: config ? config.FPOS.DATABASE : "FPOS",
    dialect: "mssql",
    host: config ? config.FPOS.HOST : "192.168.50.99",
    username: config ? config.FPOS.USERNAME : "sa",
    password: config ? config.FPOS.PASSWORD : "ces_sql2008",
    dialectOptions: {
      options: {
        encrypt: config ? config.FPOS.ENCRYPT : true,
        instanceName: "CESSQL",
      },
    },
    logging: loggingFunc,
  },
};

const start = async () => {
  try {
    await app
      .register(fastifyCors, { origin: true })
      .register(require("./plugins/appConfig"), { ...config, FPOS: undefined })
      .register(fsequelize, sequelizeConfig)
      .register(fsequelize, fposConfig)
      .register(require("./plugins/dbModels"))
      .register(require("./plugins/twilio"))
      .register(require("./routes/fpos"), { prefix: "/fpos" })
      .register(require("./routes/ing"), { prefix: "ing"})
      .listen(3000, "0.0.0.0");

    await app.ready(async () => {
      let dbSpinner = ora("Connecting to DB").start();
      try {
        await app.db.authenticate();
        console.log(chalk.green("\n✓ Database"));
      } catch (err) {
        console.log(chalk.red(`\n× Database: ${err}`));
      }
      dbSpinner.stop();
      let fposSpinner = ora("Connecting to FPOS").start();
      try {
        await app.fpos.authenticate();
        console.log(chalk.green("\n✓ FPOS Database"));
      } catch (err) {
        console.log(chalk.red(`\n× FPOS Database: ${err}`));
      }
      fposSpinner.stop();
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
