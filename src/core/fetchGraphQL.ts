/* eslint-disable @typescript-eslint/no-explicit-any */

const indexerURL = import.meta.env.VITE_SPIKA_APTOS_INDEXER_MAINNET;

const _fetchGraphQL = async (query: string, operationName: string, variables: any) => {
  const result = await fetch(`${indexerURL}/graphql`, {
    method: "POST",
    body: JSON.stringify({
      query: query,
      variables: variables,
      operationName: operationName,
    }),
  });
  return await result.json();
};

const fetchQuery = (query: string) => {
  return _fetchGraphQL(query, "MyQuery", {});
};

export const fetchGraphQL = async (query: string) => {
  const { errors, data } = await fetchQuery(query);
  if (errors) {
    console.log(errors);
  }
  return data;
};
