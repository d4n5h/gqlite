# GQLite

## About

GQLite is the "light" antithesis of GraphQL for Node.js.

| GraphQL | GQLite |
|---------|--------|
| Bloated | Simple |
| Slow    | Fast   |

We can solve 95% of what GraphQL is doing and achieve much better performance by stripping down everything that is generally unnecessary.

### Why "Lite"?

Query parser? Gone since can just use regular objects.
GQL schema? Bye-bye and hello to jsonschema.
Eager loading or relationships? left out to be handled by you (or by other libraries).

### So we're left with a really simple concept

1. Request exactly what we want.
2. Validate the request arguments.
3. That's it.

By doing so - we remove any part of the system which adds unnecessary performance penalty.

A GQLite request looks like this: (Yes, the empty curly braces are weird, but it's better than wasting computations on parsing a dedicated schema)

```javascript
const client = require('gqlite').client;

const gqlite = new client('http://localhost:9090/gqlite');

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

We use "[]" in order to indicate that we're filtering an array.
Asterisk is used to get everything under an array or object.

And the resolver (Using Objection.js):

```javascript
const gqliteServer = require('gqlite').server;
gqliteServer.resolve({
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
})


// Add to Express.js
app.post('/gqlite', gqliteServer.injectExpress);

// Or use the process function (to be used in other frameworks)
gqliteServer.process(body,(err, response)=>{
    // handle err
    // handle response
})
```
Of course that in the real world, it would be better to use separate files.

Also, note that you can keep adding methods under methods like this:

```javascript
{
    name: 'main',
    method: {
        child: {
            query: {...},
            method: {
                grandChild:{
                    query:{...},
                    method:()=>{}
                }
            }
        }
    }
}
```

Or just have one method:

```javascript
{
    name: 'main',
    query:{...}
    method:()=>{}
}
```

Anyway, we're only validating the query.
Validation of the model itself will be handled in the Objection.js model using:

```javascript
static get jsonSchema(){...}
```
