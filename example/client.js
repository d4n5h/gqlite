const client = require('../index').client;


const gqlite = new client({
    server:'http://localhost:9090',
    path: '/gqlite',
    client:'axios', // or 'undici'
    headers: {},
    extra:{
        // Extra options for axios or undici
    }
});

gqlite.request('users/getAll', {
    args: {},
    select: [{
        id: '*',
        username: '*',
        posts: [{
            id: '*',
            text: '*',
        }]
    }],
    type: 'GET'
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
        username:'*'
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
        username:'*'
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
        id:'*'
    },
}).then((response) => {
    console.log(response);
}).catch((err) => {
    console.log(err)
})

gqlite.client.close().then(()=>{
    console.log('Closed')
})