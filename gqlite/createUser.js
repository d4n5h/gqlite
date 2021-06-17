const User = require('../models/user.model')

module.exports = {
    name: 'createUser',
    schema: {
        type: "object",
        "properties": {
            "username": {
                "type": "string"
            },
            "password": {
                "type": "string"
            },
        },
        required: ["username","password"],
    },
    method: (args) => {
        return new Promise(async (resolve, reject) => {
            User.query().insert(args).then((result) => {
                resolve(result)
            }).catch((err) => {
                reject(err)
            })
        })
    }
}