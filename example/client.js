const client = require('../index').client;


const gqlite = new client({
    server:'http://localhost:9090',
    path: '/gqlite',
    headers: {},
    extra:{
        // Extra options for axios
    }
});

gqlite.request('users/getAll', {
    args: {},
    select: [{
        id: {},
        username: {},
        posts: '*'
    }],
    type: 'GET',
}).then((response) => {
    console.log(response);
}).catch((err) => {
    console.log(err)
})


gqlite.request('users/getById', {
    args: {
        id: 1,
    },
    select: {
        id:{}
    },
}).then((response) => {
    console.log(response);
}).catch((err) => {
    console.log(err)
})

gqlite.request('users/create', {
    args: {
        username: "test2",
        password: "password",
    },
    select: {
        username:{}
    },
}).then((response) => {
    console.log(response);
}).catch((err) => {
    console.log(err)
})


gqlite.request('posts/create', {
    args: {
        title: "Example post",
        text: "This is an example of a post",
        parentId: 1,
    },
    select: {
        id:{}
    },
}).then((response) => {
    console.log(response);
}).catch((err) => {
    console.log(err)
})