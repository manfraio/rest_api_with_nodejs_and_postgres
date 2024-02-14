const { Pool } = require('pg')

const pool = new Pool({
    connectionString: 'connection_string'
})

module.exports = {
    pool
}