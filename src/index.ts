/* eslint-disable @typescript-eslint/ban-types */
import bunyan from "bunyan";

type LogLevel = "debug" | "info" | "warn" | "error" | "fatal" | "silent";

const logLevelToNumber = (logLevel: string | undefined): number | undefined => {
  switch (logLevel) {
    case "debug":
      return bunyan.DEBUG;
    case "info":
      return bunyan.INFO;
    case "warn":
      return bunyan.WARN;
    case "error":
      return bunyan.ERROR;
    case "fatal":
      return bunyan.FATAL;
    case "silent":
      return bunyan.FATAL + 1;
    default:
  }
};

const numberToLogLevel = (levelNumber: number): LogLevel => {
  switch (levelNumber) {
    case bunyan.DEBUG:
      return "debug";
    case bunyan.INFO:
      return "info";
    case bunyan.WARN:
      return "warn";
    case bunyan.ERROR:
      return "error";
    case bunyan.FATAL:
      return "fatal";
    case bunyan.FATAL + 1:
      return "silent";
    default:
      throw new Error(
        `Could not convert level number to Log Level (${levelNumber})`
      );
  }
};

class ConsoleRawStream {
  write(rec: any) {
    console.log(rec);
  }
}

const chainableOperations = (message: string, _data?: object | Error) => ({
  returnError: () => new Error(message),
});

export class Logger {
  private __bunyanLogger: bunyan;
  private readonly name: string;
  private readonly logLevel: LogLevel;

  constructor(name: string, logLevel?: LogLevel) {
    const ctorLogLevel = logLevelToNumber(logLevel);
    const envLogLevel = logLevelToNumber(process.env.LOG_LEVEL);
    const defaultLogLevel = bunyan.INFO;
    const configuredLogLevel = ctorLogLevel ?? envLogLevel ?? defaultLogLevel;

    this.name = name;
    this.logLevel = numberToLogLevel(configuredLogLevel);

    this.__bunyanLogger = bunyan.createLogger({
      name,
      serializers: {
        ...bunyan.stdSerializers,
        error: bunyan.stdSerializers.err,
      },
      level: configuredLogLevel,
      // @ts-expect-error
      stream: new ConsoleRawStream(),
    });
  }

  createChildLogger(additionalData: Record<string, any>): Logger {
    const child = this.__bunyanLogger.child(additionalData);
    const newLogger = new Logger(this.name, this.logLevel);
    newLogger.__setBunyanLogger(child);
    return newLogger;
  }

  debug(message: string, data?: object | Error) {
    this.__debug(message, data);
  }

  info(message: string, data?: object | Error) {
    this.__info(message, data);
  }

  warn(message: string, data?: object | Error) {
    this.__warn(message, data);
  }

  error(message: string, data?: object | Error) {
    return this.__error(message, data);
  }

  fatal(message: string, data?: object | Error) {
    return this.__fatal(message, data);
  }

  private __debug(message: string, data?: object | Error) {
    this.__writeLog("debug", message, data);
  }

  private __info(message: string, data?: object | Error) {
    this.__writeLog("info", message, data);
  }

  private __warn(message: string, data?: object | Error) {
    this.__writeLog("warn", message, data);
  }

  private __error(message: string, data?: object | Error) {
    this.__writeLog("error", message, data);
    return chainableOperations(message, data);
  }

  private __fatal(message: string, data?: object | Error) {
    this.__writeLog("fatal", message, data);
    return chainableOperations(message, data);
  }

  private __writeLog(
    logLevel: Exclude<LogLevel, "silent">,
    message: string,
    dataOrError?: object | Error
  ) {
    if (dataOrError instanceof Error) {
      this.__bunyanLogger[logLevel]({ logLevel, err: dataOrError }, message);
    } else {
      this.__bunyanLogger[logLevel]({ logLevel, ...dataOrError }, message);
    }
  }

  private __setBunyanLogger(logger: bunyan) {
    this.__bunyanLogger = logger;
  }
}
