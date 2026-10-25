/**
 * Utility functions for cleaning GraphQL responses
 */

/**
 * Removes __typename fields from GraphQL response objects
 * @param obj - Any object or array from GraphQL response
 * @returns Cleaned object without __typename fields
 */
export function removeTypename<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removeTypename(item)) as T;
  }

  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key !== '__typename') {
        newObj[key] = removeTypename(value);
      }
    }
    return newObj;
  }

  return obj;
}

/**
 * Deep clone and clean GraphQL response
 * @param data - GraphQL response data
 * @returns Cleaned data without __typename
 */
export function cleanGraphQLResponse<T>(data: T): T {
  return removeTypename(JSON.parse(JSON.stringify(data)));
}
