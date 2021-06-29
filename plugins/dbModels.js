const { DataTypes, Sequelize } = require("sequelize");
const fp = require("fastify-plugin");

async function configureDBModels(fastify, opts, done) {
  if (!fastify.db) return done();
  const Notification = fastify.db.define("Notification", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    saleID: { type: DataTypes.UUID, allowNull: false },
    checkNumber: { type: DataTypes.INTEGER, allowNull: false },
    ticketNumber: { type: DataTypes.INTEGER, allowNull: false },
    checkDescription: { type: DataTypes.STRING, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    type: {
      type: DataTypes.STRING,
      validate: {
        isIn: [["BOARD", "PHONE"]],
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
      validate: {
        is: /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
      },
    },
  });

  const IngGroup = fastify.db.define("IngredientGroup", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: { type: DataTypes.STRING, allowNull: false },
  });

  const StorageLocation = fastify.db.define("StorageLocation", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: { type: DataTypes.STRING, allowNull: false },
  });

  const Ingredient = fastify.db.define("Ingredient", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    expirationAmount: { type: DataTypes.INTEGER, validate: { min: 1 } },
    expirationUnit: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["Minutes", "Hours", "Days", "Weeks", "Months"]],
      },
    },
    group: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: IngGroup,
        key: "id",
      },
    },
    storageLocation: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: StorageLocation,
        key: "id",
      },
    },
  });

  const CustomerWait = fastify.db.define("CustomerWait", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
      validate: {
        is: /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
      },
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    partySize: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 2,
    },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "WAITING",
      validate: {
        isIn: [["WAITING", "MESSAGED", "SEATED"]],
      },
    },
    quoteTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    messageTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    seatedTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    waitTime: {
      type: DataTypes.NUMBER,
      defaultValue: 0,
    },
  });

  fastify.decorate("models", {
    Notification,
    Ingredient,
    IngGroup,
    StorageLocation,
    CustomerWait,
  });
  await fastify.db.sync();
  done();
}

module.exports = fp(configureDBModels);
