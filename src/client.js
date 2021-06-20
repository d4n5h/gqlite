const {
    Client
} = require('undici'),
    axios = require('axios'),
    http = require('http'),
    https = require('https');

module.exports = class {
    /**
     * GQLite client
     * @param  {Object} options The options for the client (Like server)
     */
    constructor(options) {
        if (!options) throw new Error('Options must be specified');
        this.options = options

        if (!this.options.headers) this.options.headers = {
            'Content-Type': 'application/json'
        };

        if (!this.options.extra) this.options.extra = {};

        if (!this.options.client) this.options.client = 'axios';

        if (this.options.client == 'axios') {
            this.client = axios.create({
                timeout: 60000,
                httpAgent: new http.Agent({
                    keepAlive: true
                }),
                httpsAgent: new https.Agent({
                    keepAlive: true
                }),

                maxRedirects: 10,

                ...this.options.extra
            });

            this.options.path = this.options.path += '?client=axios';

        } else if (this.options.client == 'undici') {

            this.options.path = this.options.path += '?client=undici';
            this.client = new Client(this.options.server, this.options.extra)
        }
    }

    /**
     * Dispatch a GQLite request
     * @param  {String} model The model's name
     * @param  {Object} payload The payload to send to the server
     * @return {Any} The response
     */
    async request(model, payload) {
        return new Promise((resolve, reject) => {
            if (!model) throw new Error('Model is required');
            if (!payload) payload = {};
            payload.model = String(model);

            let method = 'POST',
                query = null,
                path = this.options.path;

            if (payload.type && payload.type.toUpperCase() == 'GET') {
                method = 'GET';
                query = encodeURIComponent(JSON.stringify(payload))
                path = path += '&payload=' + query
                payload = null
            } else {
                if (this.options.client == 'undici') payload = JSON.stringify(payload);
            }

            if (this.options.client == 'axios') {
                this.client({
                    method: method,
                    url: this.options.server + path,
                    data: payload,
                    headers: this.options.headers
                }).then((response) => {
                    resolve(response.data);
                }).catch((err) => {
                    reject(err.response.data);
                })
            } else if (this.options.client == 'undici') {
                this.client.request({
                    path: path,
                    method: method,
                    body: payload,
                    headers: this.headers
                }, (err, data) => {
                    if (err) {
                        reject(err)
                    } else {
                        const {
                            body
                        } = data
                        body.setEncoding('utf8')
                        body.on('data', (data) => {
                            resolve(JSON.parse(data));
                        })
                    }
                })
            }
        })
    }
}