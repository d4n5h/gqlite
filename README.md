# GQLite

## About

GQLite is the "light" antithesis of GraphQL for Node.js.
GraphQL = Bloated / GQLite = Simple
GraphQL = Slow / GQLite = Fast

### Why "Lite"?

Query parser? Gone since can just use regular old objects.
GQL schema? Bye-bye and hello to jsonschema.
Eager loading or relationships? left out to be handled by you (or by other libraries).

### So we're left with a really simple concept

1. Request exactly what we want.
2. Validate the request arguments.
3. That's it.

By doing so - we remove any part of the system which adds unnecessary performance penalty.

A GQLite request looks like this: (Yes, the empty curly braces are weird, but it's better than wasting computations on parsing a dedicated schema)

```javascript
gqlite.dispatch('users/getById', {
    args: {
        id: 1
    },
    select: [{
        id: {},
        username: {},
        posts: [{
            id: {},
            text: {},
        }],
        friends: ['*']
    }],
}).then((response) => {
    console.log(response);
}).catch((err) => {
    console.log(err)
})
```

And the resolver (Using Objection.js):

```javascript
{
    name: 'users',
    method: {
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
                    User.query().findById(args.id).withGraphFetched('posts,friends').then((result) => {
                        resolve(result)
                    }).catch((err) => {
                        reject(err)
                    })
                })
            }
        }
    }
}
```

We're only validating the query.
Validation of the model itself will be handled in the Objection.js model using:

```javascript
static get jsonSchema(){...}
```
