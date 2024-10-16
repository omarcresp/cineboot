import {
  ConnectionError,
  PostgresError,
  type QueryArguments,
  type QueryObjectResult,
  TransactionError,
} from "@dewars/postgres";
import client from "../client.ts";

export async function safeQueryObject<T>(
  query: string,
  queryArgs?: QueryArguments,
): Promise<[QueryObjectResult<T>, null] | [null, string]> {
  try {
    const result = await client.queryObject<T>(query, queryArgs);

    return [result, null];
  } catch (error) {
    if (error instanceof PostgresError) {
      return [null, `PostgresError: ${error.message}`];
    }

    if (error instanceof ConnectionError) {
      return [null, `ConnectionError: ${error.message}`];
    }

    if (error instanceof TransactionError) {
      return [null, `TransactionError: ${error.message}`];
    }

    return [null, "Unknown error"];
  }
}
