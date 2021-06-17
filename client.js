const client = require('./index').client;

const gqlite = new client('http://localhost:9090/gqlite');

gqlite.dispatch('getUsers', {
    args: {},
    select: [{
        id: '*',
        username: '*',
        posts: [{
            id: '*',
            text: '*',
        }]
    }],
}).then((response) => {
    console.log(response);
}).catch((err) => {
    console.log(err)
})


// gqlite.dispatch('getUser', {
//     args: {
//         id: 1,
//     },
//     select: {
//         username:'*'
//     },
// }).then((response) => {
//     console.log(response);
// }).catch((err) => {
//     console.log(err)
// })

// gqlite.dispatch('createUser', {
//     args: {
//         username: "test2",
//         password: "password",
//     },
//     select: {
//         username:'*'
//     },
// }).then((response) => {
//     console.log(response);
// }).catch((err) => {
//     console.log(err)
// })


// gqlite.dispatch('createPost', {
//     args: {
//         title: "Example post",
//         text: "This is an example of a post",
//         parentId: 1,
//     },
//     select: {
//         id:'*'
//     },
// }).then((response) => {
//     console.log(response);
// }).catch((err) => {
//     console.log(err)
// })