import { Token } from "./Lexer";

class SPIError extends Error {
  name: string;
  constructor(msg: string) {
    super(msg)
    this.name = Object.getPrototypeOf(this).constructor.name
  }
}

export class LexerError extends SPIError {
  msg: string;
  constructor(msg: string) {
    super(msg);
  }
}

export type ErrorInfoType = {
  token?: Token,
  errorCode?: ErrorCode,
  msg?: string;
}

export class ParserError extends SPIError {
  info: ErrorInfoType;
  constructor(info: ErrorInfoType) {
    if (info.msg) {
      super(info.msg)
    } else {
      super(`${info.errorCode} at ${info.token.toString()}`)
    }
  }
}

export class SemanticError extends SPIError {
  info: ErrorInfoType;
  constructor(info: ErrorInfoType) {
    if (info.msg) {
      super(info.msg)
    } else {
      super(`${info.errorCode} at ${info.token.toString()}`)
    }
  }
}

export enum ErrorCode {
  unexpectedLexem = 'unexpected lexem',
  unexpectedToken = 'unexpected token',
  idNotFound = 'id  not  found',
  duplicateID = 'duplicate identifier',
  wrongParamsLength = 'wrong params length'
}