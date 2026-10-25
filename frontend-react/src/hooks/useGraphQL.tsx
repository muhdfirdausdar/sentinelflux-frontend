import { DocumentNode, TypedDocumentNode, OperationVariables } from '@apollo/client';
import { useQuery, useLazyQuery } from '@apollo/client/react';
import { useEffect } from 'react';

interface UseGraphQLOptions {
  skip?: boolean;
  fetchPolicy?: 'cache-first' | 'cache-and-network' | 'network-only' | 'no-cache' | 'cache-only';
  pollInterval?: number;
  onCompleted?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * General hook for executing GraphQL queries
 * Wrapper around Apollo's useQuery with simplified API
 * 
 * @param query - GraphQL query document
 * @param variables - Query variables
 * @param options - Additional options
 * @returns { data, loading, error, refetch }
 */


export function useGraphQL<TData = any, TVariables extends OperationVariables = OperationVariables>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  variables?: TVariables,
  options: UseGraphQLOptions = {}
) {
  const queryOptions: any = {
    variables,
    skip: options.skip,
    fetchPolicy: options.fetchPolicy || 'cache-and-network',
    pollInterval: options.pollInterval,
  };

  const { data, loading, error, refetch } = useQuery<TData, TVariables>(query, queryOptions);

  // Handle onCompleted callback with useEffect (Apollo Client v4 approach)
  useEffect(() => {
    if (!loading && data && options.onCompleted) {
      options.onCompleted(data);
    }
  }, [data, loading, options.onCompleted]);

  // Handle onError callback with useEffect (Apollo Client v4 approach)
  useEffect(() => {
    if (error && options.onError) {
      options.onError(new Error(error.message));
    }
  }, [error, options.onError]);

  return {
    data,
    loading,
    error: error?.message || null,
    refetch,
  };
}

/**
 * Lazy version of useGraphQL - query is not executed automatically
 * Useful for queries triggered by user actions (like search buttons)
 * 
 * @param query - GraphQL query document
 * @param options - Additional options
 * @returns [execute, { data, loading, error }]
 */
export function useLazyGraphQL<TData = any, TVariables extends OperationVariables = OperationVariables>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options: UseGraphQLOptions = {}
) {
  const [execute, { data, loading, error }] = useLazyQuery<TData, TVariables>(query, {
    fetchPolicy: options.fetchPolicy || 'network-only',
  });

  // Handle onCompleted callback with useEffect (Apollo Client v4 approach)
  useEffect(() => {
    if (!loading && data && options.onCompleted) {
      options.onCompleted(data);
    }
  }, [data, loading, options.onCompleted]);

  // Handle onError callback with useEffect (Apollo Client v4 approach)
  useEffect(() => {
    if (error && options.onError) {
      options.onError(new Error(error.message));
    }
  }, [error, options.onError]);

  return [
    execute,
    {
      data,
      loading,
      error: error?.message || null,
    },
  ] as const;
}