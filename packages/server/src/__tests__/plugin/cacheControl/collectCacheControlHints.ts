import { GraphQLSchema, graphql } from 'graphql';
import type { CacheHint } from '../../../types/index';
import {
  ApolloServerPluginCacheControl,
  ApolloServerPluginCacheControlOptions,
} from '../../..';
import pluginTestHarness from '../../pluginTestHarness';

export async function collectCacheControlHintsAndPolicyIfCacheable(
  schema: GraphQLSchema,
  source: string,
  options: ApolloServerPluginCacheControlOptions = {},
): Promise<{
  hints: Map<string, CacheHint>;
  policyIfCacheable: Required<CacheHint> | null;
}> {
  const cacheHints = new Map<string, CacheHint>();
  const pluginInstance = ApolloServerPluginCacheControl({
    ...options,
    __testing__cacheHints: cacheHints,
  });

  const requestContext = await pluginTestHarness({
    pluginInstance,
    schema,
    graphqlRequest: {
      query: source,
    },
    executor: async (requestContext) => {
      return await graphql({
        schema,
        source: requestContext.request.query,
        contextValue: requestContext.contextValue,
      });
    },
  });

  expect(requestContext.response.errors).toBeUndefined();

  return {
    hints: cacheHints,
    policyIfCacheable: requestContext.overallCachePolicy.policyIfCacheable(),
  };
}

export async function collectCacheControlHints(
  ...args: Parameters<typeof collectCacheControlHintsAndPolicyIfCacheable>
): Promise<Map<string, CacheHint>> {
  return (await collectCacheControlHintsAndPolicyIfCacheable(...args)).hints;
}
