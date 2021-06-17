const User = require('../models/user.model')

module.exports = {
    name: 'getUser',
    schema: {
        type: "object",
        "properties": {
            "id": {
                "type": "number"
            },
        },
        required: ["id"],
    },
    method: (args) => {
        return new Promise(async (resolve, reject) => {
            User.query().findById(args.id).withGraphFetched('posts').then((result) => {
                resolve(result)
            }).catch((err) => {
                reject(err)
            })
        })
    }
}