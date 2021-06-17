const client = require('../index').client;

const gqLite = new client({
    server: 'http://localhost:9090/oql'
});


gqLite.dispatch('test', {
    args: {
        one: 6,

    },
    fields: {
        result1:{
            test1:'*'
        },
        test:{
            hello:'*'
        }
    },
}).then((response) => {
    console.log(response);
}).catch((err) => {
    console.log(err)
})