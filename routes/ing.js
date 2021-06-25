const JSON_HEADER = ["Content-Type", "application/json; charset=utf-8"];

async function routes(fastify, opts) {
    // Group Views
    fastify.get("/groups/", async (req, reply) => {
        let groups = await fastify.models.IngGroup.findAll()
        reply.code(200).headers(...JSON_HEADER).send(groups)
    })

    fastify.post("/groups/", async (req, reply) => {
        try {
            let group = await fastify.models.IngGroup.create(req.body)
            reply.code(201).headers(...JSON_HEADER).send(group)
        } catch (err) {
            reply.code(400).headers(...JSON_HEADER).send({ error: err.errors[0].message})
        }
    })

    fastify.get("/groups/:id/", async (req, reply) => {
        let groups = await fastify.models.IngGroup.findAll({where: { id: req.params.id}})
        if (groups.length) {
            reply.code(200).headers(...JSON_HEADER).send(groups[0])
        } else {
            reply.code(404).headers(...JSON_HEADER).send({error: "Group not found"})
        }
    })

    fastify.get("/groups/:id/ingredients/", async (req, reply) => {
        let groups = await fastify.models.IngGroup.findAll({where: {id: req.params.id}})
        if (groups.length) { 
            let ingredients = await fastify.models.Ingredient.findAll({where: { group: req.params.id} })
            reply.code(200).headers(...JSON_HEADER).send(ingredients)
        } else {
            reply.code(404).headers(...JSON_HEADER).send({error: "Group not found"})
        }
    })

    // Storage Views
    fastify.get("/storage/", async (req, reply) => {
        let storageLocations = await fastify.models.StorageLocation.findAll()
        reply.code(200).headers(...JSON_HEADER).send(storageLocations)
    })

    fastify.post("/storage/", async (req, reply) => {
        try {
            let storageLocation = await fastify.models.StorageLocation.create(req.body)
            reply.code(201).headers(...JSON_HEADER).send(storageLocation)
        } catch (err) {
            reply.code(400).headers(...JSON_HEADER).send({ error: err.errors[0].message})
        }
    })

    fastify.get("/storage/:id/", async (req, reply) => {
        let storageLocations = await fastify.models.StorageLocation.findAll({where: { id: req.params.id}})
        if (storageLocations.length) {
            reply.code(200).headers(...JSON_HEADER).send(storageLocations[0])
        } else {
            reply.code(404).headers(...JSON_HEADER).send({error: "Storage locations not found"})
        }
    })

    fastify.get("/storage/:id/ingredients/", async (req, reply) => {
        let storageLocations = await fastify.models.StorageLocation.findAll({where: {id: req.params.id}})
        if (storageLocations.length) { 
            let ingredients = await fastify.models.Ingredient.findAll({where: { storageLocation: req.params.id} })
            reply.code(200).headers(...JSON_HEADER).send(ingredients)
        } else {
            reply.code(404).headers(...JSON_HEADER).send({error: "Storage locations not found"})
        }
    })

    // Ingredient Views
    fastify.get("/items/", async (req, reply) => {
        let ingredients = await fastify.models.Ingredient.findAll({ order: [['group']]})
        reply.code(200).headers(...JSON_HEADER).send(ingredients)
    })

    fastify.post("/items/", async (req, reply) => {
        try {
            let ingredient = await fastify.models.Ingredient.create(req.body)
            reply.code(201).headers(...JSON_HEADER).send(ingredient)
        } catch (err) {
            reply.code(400).headers(...JSON_HEADER).send({error: err})
        }
    })

    fastify.get("/items/groups/", async (req, reply) => {
        let groups = (await fastify.models.IngGroup.findAll({ order: [['name']]})).map(group => group.dataValues)
        for (group of groups) {
            group.ingredients = await fastify.models.Ingredient.findAll({where: {group: group.id}})
        }
        reply.code(200).headers(...JSON_HEADER).send(groups)
    })

    fastify.get("/items/storage/", async (req, reply) => {
        let storageLocations = (await fastify.models.StorageLocation.findAll({ order: [['name']]})).map(storage => storage.dataValues)
        for (storage of storageLocations) {
            storage.ingredients = await fastify.models.Ingredient.findAll({where: {storageLocation: storage.id}})
        }
        reply.code(200).headers(...JSON_HEADER).send(storageLocations)
    })

    fastify.get("/items/:id/", async (req, reply) => {
        let ingredients = await fastify.models.Ingredient.findAll({where: { id: req.params.id}})
        if (ingredients.length) {
            reply.code(200).headers(...JSON_HEADER).send(ingredients[0])
        } else {
            reply.code(404).headers(...JSON_HEADER).send({error: "Ingredient not found"})
        }
    })
}

module.exports = routes;
