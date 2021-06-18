const User = require('../models/user.model')

module.exports = {
    name: 'users',
    method: {
        getAll: {
            query: {
                type: "object",
                "properties": {
                    "id": {
                        "type": "number"
                    },
                },
                required: [],
            },
            method: () => {
                return new Promise(async (resolve, reject) => {
                    User.query().withGraphFetched('posts').then((result) => {
                        resolve(result)
                    }).catch((err) => {
                        reject(err)
                    })
                })
            }
        },
        getById: {
            query: {
                type: "object",
                "properties": {
                    "id": {
                        "type": "number"
                    },
                },
                required: ["id"],
            },
            method: async (args) => {
                return new Promise(async (resolve, reject) => {
                    User.query().findById(args.id).withGraphFetched('posts').then((result) => {
                        resolve(result)
                    }).catch((err) => {
                        reject(err)
                    })
                })
            }
        },
        create: {
            query: {
                type: "object",
                "properties": {
                    "username": {
                        "type": "string"
                    },
                    "password": {
                        "type": "string"
                    },
                },
                required: ["username", "password"],
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
    }
}