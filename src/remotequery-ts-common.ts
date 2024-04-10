/* tslint:disable:no-string-literal */
/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types */

export type Simple = string | number | boolean;
export type SRecord = Record<string, Simple>;

export type Request = {
  userId?: string;
  roles?: string[];
  serviceId: string;
  parameters: Record<string, Simple>;
};

export type Context = {
  recursion: number;
  contextId: number;
  rowsAffectedList: number[];
  userMessages: string[];
  systemMessages: string[];
  statusCode: number;
  includes: Record<string, number>;
  maxRows?: number;
  serviceEntry?: ServiceEntry;
  txId?:string;
};

interface ServiceFunctionArgs {
  request: Request;
  context: Context
}

export type ServiceEntry = {
  serviceId: string;
  statements: string;
  serviceFunction?: (serviceFunctionArgs: ServiceFunctionArgs) => Promise<Result>;
  roles: string[];
  tags: Set<string>;
};

export type StatementNode = {
  cmd: string;
  statement: string;
  parameter: string;
  children?: StatementNode[];
};

export interface ExceptionResult {
  exception: string;
  stack?: string;
}

export interface Result extends Partial<ExceptionResult> {
  types?: string[];
  headerSql?: string[];
  header?: string[];
  table?: string[][];
  rowsAffected?: number;
  from?: number;
  hasMore?: boolean;
}

export interface ResultX extends Result {
  first: () => Record<string, string> | undefined;
  list: () => Record<string, string>[];
  single: () => string | undefined;
}

export type EmtpyResult = Record<string, Simple>;
export type StartBlockType = 'if' | 'if-else' | 'switch' | 'while' | 'foreach' | string;
export type EndBlockType = 'fi' | 'done' | 'end' | string;
export type RegistryType = 'node' | 'sql' | string;

export type CommandsType = {
  StartBlock: Record<StartBlockType, true>;
  EndBlock: Record<EndBlockType, true>;
  Registry: Record<RegistryType, RegistryObjFun>;
  Node: Record<string, RegistryObjFun>;
};

export interface RegistryObj {
  request: Request;
  currentResult: Result;
  statementNode: StatementNode;
  serviceEntry: ServiceEntry;
  context: Context;
}

export type RegistryObjFun = (registerObj: RegistryObj) => Promise<Result | undefined>;

export type LoggerLevel = 'debug' | 'info' | 'warn' | 'error';
export type LoggerFun = (msg: string) => void;
export type Logger = Record<LoggerLevel, LoggerFun>;

export const isError = (error: any): error is Error => {
  return typeof error.message === 'string' && typeof error.name === 'string';
};

export type ProcessSql = (sql: string, parameters?: SRecord, context?: Partial<Context>) => Promise<Result>;
export type ProcessSqlDirect = (sql: string, values: Simple[], maxRows: number) => Promise<Result>;
export type GetServiceEntry = (serviceId: string) => Promise<ServiceEntry | ExceptionResult>;

export interface Driver {
  processSql: ProcessSql;
  processSqlDirect: ProcessSqlDirect;
  getServiceEntry: GetServiceEntry;
}

export function exceptionResult(e: string | Error | unknown): ExceptionResult {
  if (isError(e)) {
    return {exception: e.message, stack: e.stack};
  } else if (typeof e === 'string') {
    return {exception: e};
  }
  return {exception: 'Unknown'};
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const isExceptionResult = (data: any): data is ExceptionResult => {
  return data && typeof data.exception === 'string';
};

export function toFirst(serviceData: Result): Record<string, string> | undefined {
  return toList(serviceData)[0];
}

export function toList<R extends Record<string, string | undefined> = Record<string, string>>(
    serviceData: Result
): R[] {
  if (Array.isArray(serviceData)) {
    return serviceData;
  }
  const list: R[] = [];
  if (serviceData.table && serviceData.header) {
    const header = serviceData.header;
    const table = serviceData.table;

    table.forEach((row) => {
      const obj: any = {};
      list.push(obj);
      for (let j = 0; j < header.length; j++) {
        const head = header[j];
        obj[head] = row[j];
      }
    });
  }
  return list;
}

export function trim(str: string): string {
  if (!str) {
    return '';
  }
  return str.trim();
}

export function noop() {
  // noop
}

export const consoleLogger: Logger = {
  // tslint:disable-next-line:no-console
  debug: (msg: string) => console.debug('debug', msg),
  // tslint:disable-next-line:no-console
  info: (msg: string) => console.info('info', msg),
  // tslint:disable-next-line:no-console
  warn: (msg: string) => console.warn('warn', msg),
  // tslint:disable-next-line:no-console
  error: (msg: string) => console.error('error', msg)
};

export const noopLogger: Logger = {
  // tslint:disable-next-line:no-console
  debug: noop,
  // tslint:disable-next-line:no-console
  info: noop,
  // tslint:disable-next-line:no-console
  warn: noop,
  // tslint:disable-next-line:no-console
  error: noop
};
