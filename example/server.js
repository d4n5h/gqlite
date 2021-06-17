const express = require('express'),
    cors = require('cors'),
    gqLite = require('../index');

const port = 9090;
const app = express()

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const q = new gqLite.server();

q.resolve(require('./gqlite/getUsers'))
q.resolve(require('./gqlite/getUser'))
q.resolve(require('./gqlite/createUser'))
q.resolve(require('./gqlite/createPost'))

app.post('/gqlite', q.injectExpress)
// app.get('/graphicalite', q.graphicaLite)

app.listen(port, () => {
    console.log(`GQLite Example listening at http://localhost:${port}`)
})