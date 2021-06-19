const {
    Client
} = require('undici')
validate = require('jsonschema').validate;

module.exports = {
    client: class {
        /**
         * GQLite client
         * @param  {String} server The options for the client (Like server)
         */
        constructor(options) {
            if (!options) throw new Error('Options must be specified');
            this.options = options
            this.client = new Client(options.server)
            if (!options.headers) options.headers = {};

            this.close = this.client.close
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

                let method = 'POST',
                    query = null,
                    path = this.options.path;

                if (payload.type == 'GET') {
                    method = 'GET';
                    query = encodeURIComponent(JSON.stringify(payload))
                    path = path += '?payload=' + query
                    payload = null
                } else {
                    payload = JSON.stringify(payload)
                }

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
                let data = '';
                req.on('data', (chunk) => {
                    data += chunk;
                });
                req.on('end', () => {
                    if (data !== '') data = JSON.parse(data)
                    this.process(req.method, data, req.query, (err, response) => {
                        if (err) return res.status(400).json(err)
                        res.status(200).json(response)
                    })
                });
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
                    // The method is GET
                    const parsed = JSON.parse(query.payload)
                    args = parsed.args
                    select = parsed.select
                    model = parsed.model
                } else {
                    // Not GET
                    args = body.args
                    select = body.select
                    model = body.model
                }

                if (!model) {
                    callback({
                        error: 'Model is not specified'
                    }, null)
                } else {

                    // Process breadcrumbs/namepaces (grandfather/father/child/grandchild/and so on...)
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

                    // No breadcrumbs, so just get the main method
                    if (!final) final = this.models[model].method

                    if (!final) {
                        // Model doesn't exists
                        callback({
                            error: 'Model does not exists'
                        }, null)
                    } else {
                        // Model exists, now lets validate the argumetns
                        if (!args) args = {};

                        let validation = null;
                        if (final.query) validation = validate(args, final.query);

                        if (validation && validation.errors.length > 0) {
                            // There's errors
                            callback({
                                errors: validation.errors
                            }, null);
                        } else {
                            // All good, let's proceed by selecting what we want from the result
                            final(args).then((result) => {
                                // Done
                                callback(null, {
                                    data: this._resolveSelect(result, select)
                                })
                            }).catch((err) => {
                                // Damn
                                callback(err, null)
                            })
                        }
                    }
                }
            }
        }
        /**
         * Select the data from the result
         * @param  {Any} result
         * @param  {Object, Array} select
         */
        _resolveSelect(result, select) {
            if (Array.isArray(result)) {
                // The result is an array
                for (let i = 0; i < result.length; i++) {
                    // Process array children
                    result[i] = this._resolveSelect(result[i], select[0])
                }
            } else {
                // The result is not an array
                if (select != '*' && select != {}) {
                    for (const key in result) {
                        if (select[key]) {
                            // We've selected this key
                            result[key] = this._resolveSelect(result[key], select[key])
                        } else {
                            // Didn't select this key, so let's remove it
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