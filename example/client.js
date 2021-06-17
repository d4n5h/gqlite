const client = require('../index').client;

const oql = new client('http://localhost:9090/oql');


oql.dispatch('test', {
    args: {
        one: 6,
        two: 6,

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