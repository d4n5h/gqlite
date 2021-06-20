const express = require('express'),
    cors = require('cors'),
    gqLite = require('../index').server;

const port = 9090;
const app = express()

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const q = new gqLite();

q.resolve(require('./gqlite/users'))
q.resolve(require('./gqlite/posts'))

app.all('/gqlite', q.injectExpress)

app.listen(port, () => {
    console.log(`GQLite Example listening at http://localhost:${port}`)
})