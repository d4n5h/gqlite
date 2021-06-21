const {
    Model
} = require('objection'),
    knex = require('../knex'),
    User = require('./user.model')

Model.knex(knex);

class Post extends Model {
    static get tableName() {
        return 'posts';
    }
    static relationMappings = {
        owner: {
            relation: Model.BelongsToOneRelation,
            modelClass: User,
            join: {
                from: 'posts.parentId',
                to: 'users.id'
            }
        }
    };
}

async function createSchema() {
    if (await knex.schema.hasTable('posts')) {
        return;
    }

    // Create database schema. You should use knex migration files
    // to do this. We create it here for simplicity.
    await knex.schema.createTable('posts', table => {
        table.increments('id').primary();
        table.integer('parentId').references('users.id');
        table.string('title')
        table.text('text')
    });
}

createSchema()

module.exports = Post