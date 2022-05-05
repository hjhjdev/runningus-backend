export function assertNonNullish<TValue>(value: TValue, message: string): asserts value is NonNullable<TValue> {
  if (value === null || value === undefined) {
    throw Error(message);
  }
}

export function assertIsError(error: unknown): asserts error is Error {
  if (!(error instanceof Error)) {
    throw error;
  }
}

export function isNotNullOrUndefined<T>(input: null | undefined | T): input is T {
  return input != null;
}
