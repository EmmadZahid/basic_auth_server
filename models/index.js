const Role = require('./role.model')
const User = require('./user.model')

const db = {}

db.role = Role
db.user = User
db.adminUser = new User({
    username:'Admin',
    email:'admin@mailinator.com',
    password:'P@ssw0rd'
})

db.ROLES = ['user', 'admin', 'moderator']

module.exports = db