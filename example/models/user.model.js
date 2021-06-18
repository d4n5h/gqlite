const {
    Model
} = require('objection'),
    knex = require('../knex'),
    Post = require('./post.model')

Model.knex(knex);

class User extends Model {
    static get tableName() {
        return 'users';
    }

    static relationMappings = {
        posts: {
          relation: Model.HasManyRelation,
          modelClass: Post,
          join: {
            from: 'users.id',
            to: 'posts.parentId'
          }
        }
      };
}

async function createSchema() {
    if (await knex.schema.hasTable('users')) {
        return;
    }

    // Create database schema. You should use knex migration files
    // to do this. We create it here for simplicity.
    await knex.schema.createTable('users', table => {
        table.increments('id').primary();
        table.string('username')
        table.string('password');
    });
}

createSchema()


module.exports = User