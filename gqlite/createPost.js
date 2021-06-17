const Post = require('../models/post.model')

module.exports = {
    name: 'createPost',
    schema: {
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
        required: ["title","text","parentId"],
    },
    method: (args) => {
        return new Promise(async (resolve, reject) => {
            Post.query().insert(args).then((result) => {
                resolve(result)
            }).catch((err) => {
                reject(err)
            })
        })
    }
}