<img src="https://user-images.githubusercontent.com/1638614/122630088-8e67ee80-d0eb-11eb-94b7-b0b2529f8a4e.png" alt="GQLite" width="200"/>

## Installation
```
$ npm install @danisl99/gqlite
```

## About

GQLite is the "light" antithesis of GraphQL for Node.js.

### Why "Lite"?

Query parser? Gone since we can just use regular objects.

GQL schema? Bye-bye and hello to jsonschema.

Eager loading or relationships? left out to be handled by you (or by other libraries).


### So we're left with a really simple concept

1. Request exactly what we want.
2. Validate the request arguments.
3. That's it.

By doing so - we remove any part of the system which adds unnecessary performance penalty.


A GQLite request looks like this: (Yes, the empty braces are weird. but, it's better than wasting computations on parsing a dedicated schema)

```javascript
const client = require('@danisl99/gqlite').client;

const gqlite = new client({
    server:'http://localhost:9090',
    path: '/gqlite'
});

gqlite.request('users/getById', {
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
        friends: []
    }],
}).then((response) => {
    console.log(response);
}).catch((err) => {
    console.log(err)
})
```

Braces ([]) in order to indicate that we're filtering an array.

Asterisk (*) is used to get everything under an array or object.

Empty braces ([]) are used to get everything under an array.

Empty curly braces ({}) are used to get everything under an object.

You can also perform the request via a GET method instead of a POST method by adding (type:'GET'):

```javascript
gqlite.request('users/getById', {
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
        friends: []
    }],
    type:'GET'
}).then((response) => {
    console.log(response);
}).catch((err) => {
    console.log(err)
})
```

And the resolver (Using Objection.js):

```javascript
const gqliteServer = require('@danisl99/gqlite').server;

const q = new gqliteServer();

q.resolve({
    name: 'users',
    schema:{
        type: 'object',
        required: ['username', 'password'],
        properties: {
            id: {
                type: 'integer'
            },
            username: {
                type: 'string',
                minLength: 3,
                maxLength: 50
            },
            password: {
                type: 'string',
                minLength: 6,
                maxLength: 50
            },
        }
    },
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
app.all('/gqlite', q.injectExpress);

/*
// Or use the process function (to be used in other frameworks)
q.process(req.method, req.body, req.query, (err, response)=>{
    // handle err
    // handle response
})
*/
```

Of course that in the real world, it would be better to use separate files.

Also, note that you can keep adding methods under methods like this:

```javascript
{
    name: 'main',
    schema:{...},
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
    schema:{...},
    query:{...}
    method:()=>{}
}
```

For a more "complete" example, you can checkout the ./example directory:

https://github.com/d4n5h/gqlite/tree/main/example


### TODO

1. Add support for "select everything but exclude x,y,z..."
2. Better documentation.

Any suggestions, comments, improvements, (some) pull requests are welcomed!
