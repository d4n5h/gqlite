const Post = require('../models/post.model')

module.exports = {
    name: 'posts',
    method: {
        create: {
            query: {
                type: "object",
                "properties": {
                    "title": {
                        "type": "string"
                    },
                    "text": {
                        "type": "string"
                    },
                    "parentId": {
                        "type": "number"
                    },
                },
                required: ["title", "text", "parentId"],
            },
            method: async (args) => {
                return new Promise(async (resolve, reject) => {
                    Post.query().insert(args).then((result) => {
                        resolve(result)
                    }).catch((err) => {
                        reject(err)
                    })
                })
            }
        }
    }

}