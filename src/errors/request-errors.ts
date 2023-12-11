export class RequestError extends Error {
  statusCode = 500;
  constructor(message?: string) {
    super(message);
    this.name = 'RequestError';
  }
}
