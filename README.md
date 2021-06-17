# GQLite

## About:
GQLite is a "light" version of GraphQL.
Query parser? Gone since can just use regular old objects.
GQL schema? Bye-bye and hello to jsonschema.

So we're left with a really simple concept:
1. Request exactly what we want.
2. Validate the arguments.
3. That's it.

No need for expensive computation and it works like a charm with Objection.js.