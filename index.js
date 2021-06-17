const axios = require('axios'),
    validate = require('jsonschema').validate;
module.exports = {
    client: class {
        /**
         * GQLite client
         * @param  {String} server The options for the client (Like server)
         */
        constructor(server) {
            if (!server) throw new Error('You must specify the server\'s URL')
            this.server = server;
        }

        /**
         * @param  {String} method The 
         * @param  {Object} payload
         */
        async dispatch(model, payload) {
            if (!model) throw new Error('Model is required');
            if (!payload) payload = {};
            payload.model = String(model);
            return new Promise((resolve, reject) => {
                axios.post(this.server, payload).then((response) => {
                    resolve(response.data);
                }).catch((err) => reject(err.response.data));
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
                this.process(req.body, (err, response) => {
                    if (err) return res.status(400).json(err)
                    res.status(200).json(response)
                })
            }
            /**
             * Process a GQLite request
             * @param  {Object} body
             * @param  {Function} callback
             */
            this.process = async (body, callback) => {
                const {
                    args,
                    select,
                    model
                } = body;
                if (!model || !this.models[model]) {
                    callback({
                        error: 'Method doesn\'t exists'
                    }, null)
                } else {
                    if (!args) args = {};

                    let validation = null;
                    if (this.models[model].schema) validation = validate(args, this.models[model].schema);

                    if (validation && validation.errors.length > 0) {
                        callback({
                            errors: validation.errors
                        }, null);
                    } else {
                        const result = await this.models[model].method(args)
                        callback(null, this.resolveSelect(result, select))
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
            if (select) {
                if (Array.isArray(select)) {
                    for (let i = 0; i < result.length; i++) {
                        result[i] = this.resolveSelect(result[i], select[0])
                    }
                } else {
                    for (const key in result) {
                        if (!select[key]) {
                            delete result[key]
                        } else {
                            if (this.objSize(result[key]) > 0 && select[key] != '*') result[key] = this.resolveSelect(result[key], select[key])
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
                schema: model.schema || null
            }
        }
    }
}