export class EntityNotFoundError extends Error {
  code: number;
  custom: boolean;

  constructor(type: any) {
    super(`Object of type ${type} has not been found`);
    this.name = "EntityNotFoundError";
    this.code = 404;
    this.custom = true;
  }
}

export class DatabaseError extends Error {
  code: number;
  custom: boolean;
  parent: any;

  constructor(parentError: any) {
    super(`Internal data storage error`);
    this.parent = parentError;
    this.code = 500;
    this.name = "DatabaseError";
    this.custom = true;
  }
}

export class InternalServerError extends Error {
  code: number;
  custom: boolean;
  parent: any;

  constructor(parentError: any) {
    super(`Internal server error`);
    this.parent = parentError;
    this.code = 500;
    this.name = "InternalServerError";
    this.custom = true;
  }
}

export class ObjectAlreadyExists extends Error {
  code: number;
  custom: boolean;

  constructor(id: string) {
    super(`Object ${id} already exists`);
    this.code = 409;
    this.name = "ObjectAlreadyExists";
    this.custom = true;
  }
}

export class IllegalStateError extends Error {
  code: number;
  custom: boolean;

  constructor(message: string) {
    super(message);
    this.code = 406;
    this.name = "IllegalStateError";
    this.custom = true;
  }
}

export class InvalidArgumentError extends Error {
  code: number;
  custom: boolean;

  constructor(message: string) {
    super(message);
    this.code = 422;
    this.name = "InvalidArgumentError";
    this.custom = true;
  }
}

export class PermissionAccessViolation extends Error {
  code: number;
  custom: boolean;

  constructor() {
    super(`User does not have access to the requested resource`);
    this.code = 403;
    this.name = "PermissionAccessViolation";
    this.custom = true;
  }
}
