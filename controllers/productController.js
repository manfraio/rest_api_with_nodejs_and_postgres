const database = require('../services/database')

exports.getAllProducts = async (req, res) => {
    try {
        const result = await database.pool.query(`
            SELECT p.id, p.name, p.description, p.price, p.currency, 
                p.quantity, p.active, p.created_date, p.updated_date,
                
                (SELECT ROW_TO_JSON(category_obj) FROM (
                    SELECT id, name FROM category WHERE id = p.category_id
                ) category_obj) AS category
                
            FROM product p`)

        return res.status(200).json(result.rows)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

exports.createProduct = async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(422).json({ error: 'Name is required' })
        }

        if (!req.body.price) {
            return res.status(422).json({ error: 'Price is required' })
        }

        if (!req.body.category_id) {
            return res.status(422).json({ error: 'Category id is required' })
        } else {
            const existsResult = await database.pool.query({
                text: 'SELECT EXISTS (SELECT * FROM category WHERE id = $1)',
                values: [req.body.category_id]
            })

            if (!existsResult.rows[0].exists) {
                return res.status(422).json({ error: 'Category id not found' })
            }
        }

        const result = await database.pool.query({
            text: `
                INSERT INTO product (name, description, price, currency, quantity, active, category_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`,
            values: [
                req.body.name,
                req.body.description ? req.body.description : null,
                req.body.price,
                req.body.currency ? req.body.currency : 'USD',
                req.body.quantity ? req.body.quantity : 0,
                'active' in req.body ? req.body.active : true,
                req.body.category_id
            ]
        })

        return res.status(201).json(result.rows[0])
        
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

exports.updateProduct = async (req, res) => {
    try {
        if (!req.body.name || !req.body.description || !req.body.price || !req.body.currency || !req.body.quantity || !req.body.active || !req.body.category_id) {
            return res.status(422).json({ error: 'All fields are required' })
        }

        const result = await database.pool.query({
            text: `
                UPDATE product
                SET name = $1, description = $2, price = $3, currency = $4, quantity = $5, active = $6, category_id = $7, updated_date = CURRENT_TIMESTAMP
                WHERE id = $8
                RETURNING *
            `,
            values: [
                req.body.name,
                req.body.description,
                req.body.price,
                req.body.currency,
                req.body.quantity,
                req.body.active,
                req.body.category_id,
                req.params.id
            ]
        })

        if (result.rowCount == 0) {
            return res.status(404).json({ error: 'Product not found' })
        }

        return res.status(200).json(result.rows[0])
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

exports.deleteProduct = async (req, res) => {
    try {
        const result = await database.pool.query({
            text: 'DELETE FROM product WHERE id = $1',
            values: [req.params.id]
        })

        if (result.rowCount == 0) {
            return res.status(404).json({ error: 'Product not found' })
        }

        return res.status(204).send()
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

exports.getProductById = async (req, res) => {
    try {
        const result = await database.pool.query({
            text: `
            SELECT p.id, p.name, p.description, p.price, p.currency, 
                p.quantity, p.active, p.created_date, p.updated_date,
                
                (SELECT ROW_TO_JSON(category_obj) FROM (
                    SELECT id, name FROM category WHERE id = p.category_id
                ) category_obj) AS category
                
            FROM product p   
            WHERE p.id = $1`,
            values: [req.params.id]
        })

        if (result.rowCount == 0) {
            return res.status(404).json({ error: 'Product not found' })
        }

        return res.status(200).json(result.rows[0])
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

exports.getProductsByCategoryId = async (req, res) => {
    try {
        const existsResult = await database.pool.query({
            text: 'SELECT EXISTS (SELECT * FROM category WHERE id = $1)',
            values: [req.params.categoryId]
        })

        if (!existsResult.rows[0].exists) {
            return res.status(404).json({ error: 'Category not found' })
        }

        const result = await database.pool.query({
            text: `
            SELECT p.id, p.name, p.description, p.price, p.currency, 
                p.quantity, p.active, p.created_date, p.updated_date,
                
                (SELECT ROW_TO_JSON(category_obj) FROM (
                    SELECT id, name FROM category WHERE id = p.category_id
                ) category_obj) AS category
                
            FROM product p   
            WHERE p.category_id = $1`,
            values: [req.params.categoryId]
        })

        return res.status(200).json(result.rows)
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}