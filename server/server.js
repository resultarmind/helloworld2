const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt } = require('graphql');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'hello-world',
  password: '1020',
  port: 5432,
});

const createUser = async ({ name, age, interest }) => {
  const query = 'INSERT INTO users (name, age, interest) VALUES ($1, $2, $3) RETURNING *';
  const values = [name, age, interest];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      ping: {
        type: GraphQLString,
        resolve: () => 'pong',
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      createUser: {
        type: GraphQLString,
        args: {
          name: { type: GraphQLString },
          age: { type: GraphQLInt },
          interest: { type: GraphQLString },
        },
        resolve: async (_, args) => {
          const { name, age, interest } = args;
          const newUser = await createUser({ name, age, interest });
          return `User ${newUser.name} created successfully!`;
        },
      },
    },
  }),
});

const app = express();

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));

// Endpoint to check server status
app.get('/status', (_, res) => {
  res.status(200).send('Server is running');
});

const PORT = 4000; // Change to the desired port number
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/graphql`);
});
