const User = require('../models/user.model')

module.exports = {
    name: 'getUsers',
    schema: {
        type: "object",
        "properties": {
            "id": {
                "type": "number"
            },
        },
        required: [],
    },
    method: (args) => {
        return new Promise(async (resolve, reject) => {
            User.query().withGraphFetched('posts').then((result) => {
                resolve(result)
            }).catch((err) => {
                reject(err)
            })
        })
    }
}