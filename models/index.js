const Role = require('./role.model')
const User = require('./user.model')

const db = {}

db.role = Role
db.user = User

db.ROLES = ['user', 'admin', 'moderator']

module.exports = db