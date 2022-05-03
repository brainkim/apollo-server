import {
  ApolloServerPluginSchemaReporting,
  ApolloServerPluginSchemaReportingOptions,
} from '../../..';
import pluginTestHarness from '../../pluginTestHarness';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphql } from 'graphql';

describe('end-to-end', () => {
  async function runTest({
    pluginOptions = {},
  }: {
    pluginOptions?: ApolloServerPluginSchemaReportingOptions;
  }) {
    return await pluginTestHarness({
      pluginInstance: ApolloServerPluginSchemaReporting(pluginOptions),
      graphqlRequest: {
        query: 'query { __typename }',
      },
      executor: async ({ request: { query }, contextValue }) => {
        return await (graphql({
          schema: makeExecutableSchema({ typeDefs: 'type Query { foo: Int }' }),
          source: query,
          // context is needed for schema instrumentation to find plugins.
          contextValue,
          // TODO(brian): I promise not to leave this here I’m just
          // experimenting
        }) as any);
      },
    });
  }

  it('fails for unparsable overrideReportedSchema', async () => {
    await expect(
      runTest({
        pluginOptions: {
          overrideReportedSchema: 'type Query {',
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"The schema provided to overrideReportedSchema failed to parse or validate: Syntax Error: Expected Name, found <EOF>."`,
    );
  });

  it('fails for invalid overrideReportedSchema', async () => {
    await expect(
      runTest({
        pluginOptions: {
          overrideReportedSchema: 'type Query',
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"The schema provided to overrideReportedSchema failed to parse or validate: Type Query must define one or more fields."`,
    );
  });
});
