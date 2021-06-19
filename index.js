const axios = require('axios'),
    validate = require('jsonschema').validate;

module.exports = {
    client: class {
        /**
         * GQLite client
         * @param  {String} server The options for the client (Like server)
         */
        constructor(server, headers) {
            if (!server) throw new Error('The server must be specified');
            this.server = server;
            if (!headers) headers = {};
            this.headers = headers;
        }

        /**
         * Dispatch a GQLite request
         * @param  {String} model The model's name
         * @param  {Object} payload The payload to send to the server
         * @return {Any} The response
         */
        async dispatch(model, payload) {
            return new Promise((resolve, reject) => {
                if (!model) throw new Error('Model is required');
                if (!payload) payload = {};
                payload.model = String(model);
                if (payload.type == 'GET') {
                    payload = encodeURIComponent(JSON.stringify(payload))
                    axios.get(this.server + '?payload=' + payload, {
                        headers: this.headers
                    }).then((response) => {
                        resolve(response.data);
                    }).catch((err) => reject(err.response.data));
                } else {
                    axios.post(this.server, payload, {
                        headers: this.headers
                    }).then((response) => {
                        resolve(response.data);
                    }).catch((err) => reject(err.response.data));
                }
            })
        }
    },
    server: class {
        constructor() {
            this.models = {};

            /**
             * Inject to an ExpressJS POST route
             * @param  {Object} req
             * @param  {Object} res
             */
            this.injectExpress = async (req, res) => {
                this.process(req.method, req.body, req.query, (err, response) => {
                    if (err) return res.status(400).json(err)
                    res.status(200).json(response)
                })
            }

            /**
             * Process a GQLite request
             * @param  {String} method
             * @param  {Object} body
             * @param  {Object} query
             * @param  {Function} callback
             */
            this.process = async (method, body, query, callback) => {
                let args, select, model
                if (method == 'GET') {
                    const parsed = JSON.parse(query.payload)
                    args = parsed.args
                    select = parsed.select
                    model = parsed.model
                } else {
                    args = body.args
                    select = body.select
                    model = body.model
                }

                if (!model) {
                    callback({
                        error: 'Model is not specified'
                    }, null)
                } else {

                    let breadCrumbs = [];
                    if (model.indexOf('/') >= 0) breadCrumbs = model.split('/')

                    let final = null;

                    for (let i = 0; i < breadCrumbs.length; i++) {
                        if (!final) {
                            final = this.models[breadCrumbs[i]].method
                        } else {
                            final = final[breadCrumbs[i]].method
                        }
                    }

                    if (!final) final = this.models[model].method

                    if (!final) {
                        callback({
                            error: 'Model does not exists'
                        }, null)
                    } else {
                        if (!args) args = {};

                        let validation = null;
                        if (final.query) validation = validate(args, final.query);

                        if (validation && validation.errors.length > 0) {
                            callback({
                                errors: validation.errors
                            }, null);
                        } else {
                            final(args).then((result) => {
                                callback(null, this.resolveSelect(result, select))
                            }).catch((err) => {
                                callback(err, null)
                            })

                        }
                    }
                }
            }
        }

        objSize(obj) {
            let size = 0,
                key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };

        resolveSelect(result, select) {
            if (Array.isArray(result)) {
                for (let i = 0; i < result.length; i++) {
                    result[i] = this.resolveSelect(result[i], select[0])
                }
            } else {
                if (select != '*' && select != {}) {
                    for (const key in result) {
                        if (select[key]) {
                            result[key] = this.resolveSelect(result[key], select[key])
                        } else {
                            delete result[key]
                        }
                    }
                }
            }
            return result
        }
        

        /**
         * Resolve a model
         * @param  {Object} model
         */
        resolve(model) {
            if (!model.name) throw new Error('Model must have a name');
            if (!model.method) throw new Error('Model must have a method');
            this.models[model.name] = {
                method: model.method,
                query: model.query || null
            }
        }
    }
}