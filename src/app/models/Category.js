const db = require('../config/db')

module.exports = {
    all() {
       return db.query(`SELECT * FROM categories`)//busca todas as categorias na tabela categories
    }
}