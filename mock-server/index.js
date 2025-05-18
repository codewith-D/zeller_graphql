import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchema } from "@graphql-tools/load";
import { addMocksToSchema } from "@graphql-tools/mock";

import { listZellerCustomers } from "./queries/listZellerCustomers.js";
import { getZellerCustomer } from "./queries/getZellerCustomer.js";

const schema = await loadSchema("schema.gql", {
  loaders: [new GraphQLFileLoader()],
});

const server = new ApolloServer({
  schema: addMocksToSchema({
    schema,
    resolvers: {
      Query: {
        listZellerCustomers: (_, { filter }) => {
          let filteredItems = [...listZellerCustomers.items];
          if (filter) {
            if (filter.role && filter.role.eq) {
              filteredItems = filteredItems.filter(
                (item) => item.role === filter.role.eq
              );
            }
            if (filter.name && filter.name.contains) {
              filteredItems = filteredItems
                .map((item) => {
                  if (item.name.toLowerCase().includes(filter.name.contains.toLowerCase())) {
                    return item;
                  }
                })
                .filter((item) => item != null);
            }
          }

          return {
            items: filteredItems,
          };
        },
        getZellerCustomer: () => getZellerCustomer,
      },
    },
  }),
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 9002 },
});

// eslint-disable-next-line no-console
console.log(`🚀 Server is using is listening at ${url}`);
