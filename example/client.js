const client = require('../index').client;

const oql = new client('http://localhost:9090/gqlite');

oql.dispatch('getUsers', {
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


// oql.dispatch('getUser', {
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

// oql.dispatch('createUser', {
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


// oql.dispatch('createPost', {
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