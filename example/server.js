const express = require('express'),
    cors = require('cors'),
    gqLite = require('../index');

const port = 9090;
const app = express()

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const q = new gqLite.server();

q.resolve({
    name: 'test',
    schema: {
        type: "object",
        "properties": {
            "one": { "type": "number" },
            "two": { "type": "number" }
        },
        required: ["one", "two"],
    },
    method: (args) => {
        return new Promise((resolve, reject) => {
            resolve({
                result1: {
                    test1: args.one + args.two,
                    test2: 123,
                },
                result2: args.one - args.two,
            })
        })
    }
})

app.post('/oql', q.injectExpress)

app.listen(port, () => {
    console.log(`GQLite Example listening at http://localhost:${port}`)
})