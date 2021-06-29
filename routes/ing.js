const JSON_HEADER = ["Content-Type", "application/json; charset=utf-8"];

async function routes(fastify, opts) {
  // Group Views
  fastify.get("/groups/", async (req, reply) => {
    let groups = await fastify.models.IngGroup.findAll();
    reply
      .code(200)
      .headers(...JSON_HEADER)
      .send(groups);
  });

  fastify.post("/groups/", async (req, reply) => {
    try {
      let group = await fastify.models.IngGroup.create(req.body);
      reply
        .code(201)
        .headers(...JSON_HEADER)
        .send(group);
    } catch (err) {
      reply
        .code(400)
        .headers(...JSON_HEADER)
        .send({ error: err.errors[0].message });
    }
  });

  fastify.get("/groups/:id/", async (req, reply) => {
    let group = await fastify.models.IngGroup.findByPk(req.params.id);
    if (group) {
      reply
        .code(200)
        .headers(...JSON_HEADER)
        .send(group);
    } else {
      reply
        .code(404)
        .headers(...JSON_HEADER)
        .send({ error: "Group not found" });
    }
  });

  fastify.put("/groups/:id/", async (req, reply) => {
    let group = await fastify.models.IngGroup.findByPk(req.params.id);
    if (group) {
      Object.keys(req.body).forEach((key) => {
        if (group[key] !== undefined) group[key] = req.body[key];
      });
      await group.save();
      reply
        .code(200)
        .headers(...JSON_HEADER)
        .send(group);
    } else {
      reply
        .code(404)
        .headers(...JSON_HEADER)
        .send({ error: "Group not found" });
    }
  });

  fastify.delete("/groups/:id/", async (req, reply) => {
    let group = await fastify.models.IngGroup.findByPk(req.params.id);
    if (group) {
      await group.destroy();
      reply.code(204).send();
    } else {
      reply
        .code(404)
        .headers(...JSON_HEADER)
        .send({ error: "Group not found" });
    }
  });

  fastify.get("/groups/:id/ingredients/", async (req, reply) => {
    let group = await fastify.models.IngGroup.findByPk(req.params.id);
    if (group) {
      let ingredients = await fastify.models.Ingredient.findAll({
        where: { group: req.params.id },
        order: [["name"]],
      });
      reply
        .code(200)
        .headers(...JSON_HEADER)
        .send(ingredients);
    } else {
      reply
        .code(404)
        .headers(...JSON_HEADER)
        .send({ error: "Group not found" });
    }
  });

  // Storage Views
  fastify.get("/storage/", async (req, reply) => {
    let storageLocations = await fastify.models.StorageLocation.findAll();
    reply
      .code(200)
      .headers(...JSON_HEADER)
      .send(storageLocations);
  });

  fastify.post("/storage/", async (req, reply) => {
    try {
      let storageLocation = await fastify.models.StorageLocation.create(
        req.body
      );
      reply
        .code(201)
        .headers(...JSON_HEADER)
        .send(storageLocation);
    } catch (err) {
      reply
        .code(400)
        .headers(...JSON_HEADER)
        .send({ error: err.errors[0].message });
    }
  });

  fastify.get("/storage/:id/", async (req, reply) => {
    let storageLocation = await fastify.models.StorageLocation.findByPk(
      req.params.id
    );
    if (storageLocation) {
      reply
        .code(200)
        .headers(...JSON_HEADER)
        .send(storageLocation);
    } else {
      reply
        .code(404)
        .headers(...JSON_HEADER)
        .send({ error: "Storage location not found" });
    }
  });

  fastify.put("/storage/:id/", async (req, reply) => {
    let storage = await fastify.models.StorageLocation.findByPk(req.params.id);
    if (storage) {
      Object.keys(req.body).forEach((key) => {
        if (storage[key] !== undefined) storage[key] = req.body[key];
      });
      await storage.save();
      reply
        .code(200)
        .headers(...JSON_HEADER)
        .send(storage);
    } else {
      reply
        .code(404)
        .headers(...JSON_HEADER)
        .send({ error: "Storage location not found" });
    }
  });

  fastify.delete("/storage/:id/", async (req, reply) => {
    let storage = await fastify.models.StorageLocation.findByPk(req.params.id);
    if (storage) {
      await storage.destroy();
      reply.code(204).send();
    } else {
      reply
        .code(404)
        .headers(...JSON_HEADER)
        .send({ error: "Storage location not found" });
    }
  });

  fastify.get("/storage/:id/ingredients/", async (req, reply) => {
    let storageLocation = await fastify.models.StorageLocation.findByPk(
      req.params.id
    );
    if (storageLocation) {
      let ingredients = await fastify.models.Ingredient.findAll({
        where: { storageLocation: req.params.id },
        order: [["name"]],
      });
      reply
        .code(200)
        .headers(...JSON_HEADER)
        .send(ingredients);
    } else {
      reply
        .code(404)
        .headers(...JSON_HEADER)
        .send({ error: "Storage location not found" });
    }
  });

  // Ingredient Views
  fastify.get("/items/", async (req, reply) => {
    let ingredients = await fastify.models.Ingredient.findAll({
      order: [["group"], ["name"]],
    });
    reply
      .code(200)
      .headers(...JSON_HEADER)
      .send(ingredients);
  });

  fastify.post("/items/", async (req, reply) => {
    try {
      let ingredient = await fastify.models.Ingredient.create(req.body);
      reply
        .code(201)
        .headers(...JSON_HEADER)
        .send(ingredient);
    } catch (err) {
      reply
        .code(400)
        .headers(...JSON_HEADER)
        .send({ error: err });
    }
  });

  fastify.get("/items/groups/", async (req, reply) => {
    let groups = (
      await fastify.models.IngGroup.findAll({ order: [["name"]] })
    ).map((group) => group.dataValues);
    for (group of groups) {
      group.ingredients = await fastify.models.Ingredient.findAll({
        where: { group: group.id },
        order: [["name"]],
      });
    }
    reply
      .code(200)
      .headers(...JSON_HEADER)
      .send(groups);
  });

  fastify.get("/items/storage/", async (req, reply) => {
    let storageLocations = (
      await fastify.models.StorageLocation.findAll({ order: [["name"]] })
    ).map((storage) => storage.dataValues);
    for (storage of storageLocations) {
      storage.ingredients = await fastify.models.Ingredient.findAll({
        where: { storageLocation: storage.id },
      });
    }
    reply
      .code(200)
      .headers(...JSON_HEADER)
      .send(storageLocations);
  });

  fastify.get("/items/:id/", async (req, reply) => {
    let ingredient = await fastify.models.Ingredient.findByPk(req.params.id);
    if (ingredient) {
      reply
        .code(200)
        .headers(...JSON_HEADER)
        .send(ingredient);
    } else {
      reply
        .code(404)
        .headers(...JSON_HEADER)
        .send({ error: "Ingredient not found" });
    }
  });

  fastify.put("/items/:id/", async (req, reply) => {
    let ingredient = await fastify.models.Ingredient.findByPk(req.params.id);
    if (ingredient) {
      Object.keys(req.body).forEach((key) => {
        if (ingredient[key] !== undefined) ingredient[key] = req.body[key];
      });
      await ingredient.save();
      reply
        .code(200)
        .headers(...JSON_HEADER)
        .send(ingredient);
    } else {
      reply
        .code(404)
        .headers(...JSON_HEADER)
        .send({ error: "Ingredient not found" });
    }
  });

  fastify.delete("/items/:id/", async (req, reply) => {
    let ingredient = await fastify.models.Ingredient.findByPk(req.params.id);
    if (ingredient) {
      await ingredient.destroy();
      reply.code(204).send();
    } else {
      reply
        .code(404)
        .headers(...JSON_HEADER)
        .send({ error: "Ingredient not found" });
    }
  });
}

module.exports = routes;
