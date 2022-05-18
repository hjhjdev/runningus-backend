export function parseErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return JSON.stringify(error);
}

export class SocketError extends Error {
  public data: {
    type: string;
  };

  public body: unknown;

  constructor(message: string, data?: { type: string }) {
    super(`Socket middleware response: ${message}`);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SocketError);
    }

    this.data = data || { type: 'UNSPECIFIED' };
  }
}
