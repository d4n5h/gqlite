const axios = require('axios'),
    validate = require('jsonschema').validate;
module.exports = {
    client: class {
        constructor(options) {
            this.options = options;
        }
        async dispatch(method, payload) {
            if (!method) throw new Error('Method is required');
            if (!payload) payload = {};
            payload.method = String(method);
            return new Promise((resolve, reject) => {
                axios.post(this.options.server, payload).then((response) => {
                    resolve(response.data);
                }).catch((err) => reject(err.response.data));
            })
        }
    },
    server: class {
        constructor() {
            this.methods = {};

            this.injectExpress = async (req, res) => {
                this.process(req.body, (err, response) => {
                    if (err) return res.status(400).json(err)
                    res.status(200).json(response)
                })
            }

            this.process = async (body, cb) => {
                const { args, fields, method } = body;
                if (!method || !this.methods[method]) {
                    cb({ error: 'Method doesn\'t exists' }, null)
                } else {
                    if (!args) args = {};

                    let validation = null;
                    if (this.methods[method].schema) validation = validate(args, this.methods[method].schema);

                    if (validation && validation.errors.length > 0) {
                        cb({ errors: validation.errors }, null);
                    } else {
                        const result = await this.methods[method].method(args)
                        cb(null, this.resolveFields(result, fields))
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
        resolveFields(result, fields) {
            if (fields) {
                for (const key in result) {
                    if (!fields[key]) {
                        delete result[key]
                    } else {
                        if (this.objSize(result[key]) > 0 && fields[key] != '*') result[key] = this.resolveFields(result[key], fields[key])
                    }
                }
                return result
            } else {
                return result
            }
        }
        resolve(model) {
            if (!model.name) throw new Error('Model must have a name');
            if (!model.method) throw new Error('Model must have a method');
            this.methods[model.name] = {
                method: model.method,
                schema: model.schema || null
            }
        }

    }
}