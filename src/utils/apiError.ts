export type ApiFieldError = {
  field?: string;
  message: string;
};

export class ApiError extends Error {
  public readonly statusCode: number;

  public readonly errors?: ApiFieldError[];

  constructor(statusCode: number, message: string, errors?: ApiFieldError[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

