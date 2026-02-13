export class NotFoundError extends Error {
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class StorageError extends Error {
  constructor(operation: string, cause?: Error) {
    super(`Storage operation failed: ${operation}${cause ? ` — ${cause.message}` : ""}`);
    this.name = "StorageError";
    if (cause) this.cause = cause;
  }
}
