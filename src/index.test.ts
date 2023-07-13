/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment,  @typescript-eslint/no-unsafe-member-access */

import mockedEnv from "mocked-env";
import { Logger } from "./index";

const consoleSpy = jest.spyOn(global.console, "log");

afterEach(() => {
  consoleSpy.mockClear();
});

describe("initialisation", () => {
  it("should set the loggers level automatically from the environment variable LOG_LEVEL", () => {
    const restoreEnv = mockedEnv({
      LOG_LEVEL: "warn",
    });

    const logger = new Logger("unit-tests");

    logger.debug("Testing 1,2,3..."); // Shouldn't log
    logger.info("Testing 1,2,3..."); // Shouldn't log
    logger.warn("Testing 1,2,3...");
    logger.error("Testing 1,2,3...");
    logger.fatal("Testing 1,2,3...");

    expect(consoleSpy).toHaveBeenCalledTimes(3);

    restoreEnv();
  });

  it("should set the loggers level to info by default", () => {
    const logger = new Logger("unit-tests");

    logger.debug("Testing 1,2,3..."); // Shouldn't log
    logger.info("Testing 1,2,3...");
    logger.warn("Testing 1,2,3...");
    logger.error("Testing 1,2,3...");
    logger.fatal("Testing 1,2,3...");

    expect(consoleSpy).toHaveBeenCalledTimes(4);
  });

  it("should prefer the logger level supplied via the ctor over the environment variable LOG_LEVEL", () => {
    const restoreEnv = mockedEnv({
      LOG_LEVEL: "warn",
    });

    const logger = new Logger("unit-tests", "debug");

    logger.debug("Testing 1,2,3...");
    logger.info("Testing 1,2,3...");
    logger.warn("Testing 1,2,3...");
    logger.error("Testing 1,2,3...");
    logger.fatal("Testing 1,2,3...");

    expect(consoleSpy).toHaveBeenCalledTimes(5);

    restoreEnv();
  });
});

describe("basic functionality", () => {
  it.each`
    logLevel   | level
    ${"debug"} | ${20}
    ${"info"}  | ${30}
    ${"warn"}  | ${40}
    ${"error"} | ${50}
    ${"fatal"} | ${60}
  `(
    "should log at $logLevel level when only a message is supplied",
    ({ logLevel, level }: { logLevel: string; level: number }) => {
      const logger = new Logger("unit-tests", "debug");

      // @ts-expect-error
      logger[logLevel]("Testing 1,2,3...");

      expect(consoleSpy).toHaveBeenCalledTimes(1);

      const consoleArgument = JSON.parse(consoleSpy.mock.calls[0][0]);

      expect(consoleArgument).toEqual(
        expect.objectContaining({
          msg: "Testing 1,2,3...",
          name: "unit-tests",
          level,
          logLevel,
          pid: expect.any(Number),
          time: expect.stringMatching(/^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d/),
          hostname: expect.any(String),
        })
      );
    }
  );

  it.each`
    logLevel   | level
    ${"debug"} | ${20}
    ${"info"}  | ${30}
    ${"warn"}  | ${40}
    ${"error"} | ${50}
    ${"fatal"} | ${60}
  `(
    "should log at $logLevel level when a message and data is supplied",
    ({ logLevel, level }: { logLevel: string; level: number }) => {
      const logger = new Logger("unit-tests", "debug");

      const data = {
        hello: "world",
        bool: false,
        num: 123,
        decimal: 123.456,
        nullz: null,
        arrayz: [1, "two", 3],
        deeply: {
          nested: {
            object: {
              foo: "bar",
            },
          },
        },
      };

      // @ts-expect-error
      logger[logLevel]("Testing 1,2,3...", data);

      expect(consoleSpy).toHaveBeenCalledTimes(1);

      const consoleArgument = JSON.parse(consoleSpy.mock.calls[0][0]);

      expect(consoleArgument).toEqual(
        expect.objectContaining({
          msg: "Testing 1,2,3...",
          name: "unit-tests",
          level,
          logLevel,
          pid: expect.any(Number),
          time: expect.stringMatching(/^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d/),
          hostname: expect.any(String),
          ...data,
        })
      );
    }
  );

  it.each`
    logLevel   | loggerLevel
    ${"debug"} | ${"info"}
    ${"info"}  | ${"warn"}
    ${"warn"}  | ${"error"}
    ${"error"} | ${"fatal"}
    ${"fatal"} | ${"silent"}
  `(
    "should not log a $logLevel message when the logger level is set to $loggerLevel",
    ({ logLevel, loggerLevel }: { logLevel: string; loggerLevel: number }) => {
      // @ts-expect-error
      const logger = new Logger("unit-tests", loggerLevel);

      // @ts-expect-error
      logger[logLevel]("Testing 1,2,3...");

      expect(consoleSpy).toHaveBeenCalledTimes(0);
    }
  );

  it("should log nothing when loggers level is configured to silent", () => {
    const logger = new Logger("unit-tests", "silent");

    logger.debug("Testing 1,2,3...");
    logger.info("Testing 1,2,3...");
    logger.warn("Testing 1,2,3...");
    logger.error("Testing 1,2,3...");
    logger.fatal("Testing 1,2,3...");

    expect(consoleSpy).toHaveBeenCalledTimes(0);
  });
});

describe("logging errors", () => {
  it.each`
    logLevel
    ${"debug"}
    ${"info"}
    ${"warn"}
    ${"error"}
    ${"fatal"}
  `(
    "should log error details when supplied instead of a data object at $logLevel level",
    ({ logLevel }: { logLevel: string }) => {
      const logger = new Logger("unit-tests", "debug");

      // @ts-expect-error
      logger[logLevel]("Testing errors...", new Error("Boom!"));

      expect(consoleSpy).toHaveBeenCalledTimes(1);

      const consoleArgument = JSON.parse(consoleSpy.mock.calls[0][0]);

      expect(consoleArgument).toEqual(
        expect.objectContaining({
          msg: "Testing errors...",
          err: {
            name: "Error",
            message: "Boom!",
            stack: expect.stringMatching(/^Error: Boom!\n {4}at/), // Stack trace of error as string
          },
        })
      );
    }
  );

  it.each`
    logLevel   | errKey
    ${"debug"} | ${"err"}
    ${"info"}  | ${"err"}
    ${"warn"}  | ${"err"}
    ${"error"} | ${"err"}
    ${"fatal"} | ${"err"}
    ${"debug"} | ${"error"}
    ${"info"}  | ${"error"}
    ${"warn"}  | ${"error"}
    ${"error"} | ${"error"}
    ${"fatal"} | ${"error"}
  `(
    "should log error details when supplied as part of a data object at $logLevel level on key '$errKey'",
    ({ logLevel, errKey }: { logLevel: string; errKey: "err" | "error" }) => {
      const logger = new Logger("unit-tests", "debug");

      // @ts-expect-error
      logger[logLevel]("Testing errors...", {
        [errKey]: new Error("Boom!"),
        hello: "logger",
      });

      expect(consoleSpy).toHaveBeenCalledTimes(1);

      const consoleArgument = JSON.parse(consoleSpy.mock.calls[0][0]);

      expect(consoleArgument).toEqual(
        expect.objectContaining({
          msg: "Testing errors...",
          hello: "logger",
          [errKey]: {
            name: "Error",
            message: "Boom!",
            stack: expect.stringMatching(/^Error: Boom!\n {4}at/), // Stack trace of error as string
          },
        })
      );
    }
  );
});

describe("return error after logging", () => {
  it.each`
    logLevel   | level
    ${"error"} | ${50}
    ${"fatal"} | ${60}
  `(
    "should return an error after logging at $logLevel level when .returnError() is invoked",
    ({ logLevel, level }: { logLevel: string; level: number }) => {
      const logger = new Logger("unit-tests", "debug");

      // @ts-expect-error
      const error = logger[logLevel](
        "Bang! and the code is gone."
      ).returnError();

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toEqual("Bang! and the code is gone.");

      expect(consoleSpy).toHaveBeenCalledTimes(1);

      const consoleArgument = JSON.parse(consoleSpy.mock.calls[0][0]);

      expect(consoleArgument).toEqual(
        expect.objectContaining({
          msg: "Bang! and the code is gone.",
          name: "unit-tests",
          logLevel,
          level,
          pid: expect.any(Number),
          time: expect.stringMatching(/^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d/),
          hostname: expect.any(String),
        })
      );
    }
  );

  it.each`
    logLevel   | level
    ${"debug"} | ${20}
    ${"info"}  | ${30}
    ${"warn"}  | ${40}
  `(
    "should NOT return .returnError() when logging at $logLevel level",
    ({ logLevel }: { logLevel: string; level: number }) => {
      const logger = new Logger("unit-tests", "debug");

      expect(
        // @ts-expect-error
        logger[logLevel]("Bang! and the code is gone.")
      ).toBeUndefined();
    }
  );
});

describe("child loggers", () => {
  it("should attach the additional data fields supplied at initialisation to all log messages", () => {
    const parentLogger = new Logger("parent", "debug");
    const childLogger = parentLogger.createChildLogger({ subPackage: "child" });

    parentLogger.info("Unit test for child loggers", { hello: "world" });
    childLogger.info("Unit test for child loggers", { hello: "world" });

    expect(consoleSpy).toHaveBeenCalledTimes(2);

    const parentConsoleLog = JSON.parse(consoleSpy.mock.calls[0][0]);
    const childConsoleLog = JSON.parse(consoleSpy.mock.calls[1][0]);

    expect(parentConsoleLog).not.toEqual(
      expect.objectContaining({
        subPackage: "child",
      })
    );

    expect(childConsoleLog).toEqual(
      expect.objectContaining({
        name: "parent",
        subPackage: "child",

        msg: "Unit test for child loggers",
        hello: "world",
        level: 30,
        logLevel: "info",
        pid: expect.any(Number),
        time: expect.stringMatching(/^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d/),
        hostname: expect.any(String),
      })
    );
  });

  it("should have the same name as the parent logger", () => {
    const parentLogger = new Logger("parent", "debug");
    const childLogger = parentLogger.createChildLogger({ subPackage: "child" });

    childLogger.info("Unit test for child loggers", { hello: "world" });

    expect(consoleSpy).toHaveBeenCalledTimes(1);

    const childConsoleLog = JSON.parse(consoleSpy.mock.calls[0][0]);

    expect(childConsoleLog).toEqual(
      expect.objectContaining({
        name: "parent",
        subPackage: "child",
      })
    );
  });

  it("should have the same log level configured as the parent logger", () => {
    const parentLogger = new Logger("parent", "debug");
    const childLogger = parentLogger.createChildLogger({ subPackage: "child" });

    // @ts-expect-error
    expect(childLogger.logLevel).toBe("debug");
  });
});
