const Post = require('../models/post.model')

module.exports = {
    name: 'posts',
    schema: {
        type: 'object',
        required: ['parentId', 'title', 'text'],

        properties: {
            id: {
                type: 'integer'
            },
            parentId: {
                type: ['integer', 'null']
            },
            title: {
                type: 'string',
                minLength: 1,
                maxLength: 255
            },
            text: {
                type: 'string',
                minLength: 1,
            },
        }
    },
    method: {
        create: {
            method: async (args, data) => {
                return new Promise(async (resolve, reject) => {
                    Post.query().insert(data).then((result) => {
                        resolve(result)
                    }).catch((err) => {
                        reject(err)
                    })
                })
            }
        }
    }
}