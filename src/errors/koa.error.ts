/**
 * Koa custom erros class
 */
export class KoaError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);

    this.status = status;
  }
}
