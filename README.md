# logger-nodejs
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

A simple and fast JSON logging library for Node.js services

## Usage

```javascript
import { Logger } from "@cuckoointernet/logger-nodejs";

const logger = new Logger("my-package");
```

### Log simple messages at different levels

```javascript
logger.debug("Hello Cuckoo!");
logger.info("Hello Cuckoo!");
logger.warn("Hello Cuckoo!");
logger.error("Hello Cuckoo!");
logger.fatal("Hello Cuckoo!");
```

### Log additional data via the second argument

```javascript
// Data in object supplied is automatically merged into the log record
logger.info("Hello Cuckoo!", { colour: "yellow" });
```

#### Serialisers

Data provided to the second argument undergoes additional processing if they match certain keys. For instance, if you pass an object with an `error` key it will be run through a serialiser that is able to process stack information in a better way. The standard serialisers are:

| Field   | Description                                                                                                                    |
| ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `error` | Used for serialising JavaScript error objects, including traversing an error's cause chain for error objects with a `.cause()` |
| `err`   | Same as `error` (deprecated)                                                                                                   |
| `req`   | Common fields from a node.js HTTP request object                                                                               |
| `res`   | Common fields from a node.js HTTP response object                                                                              |

### Log JavaScript `Error` objects

```javascript
// Alternatively you can supply an instance of Error to log its exception details via the second argument
logger.warn("Sad Cuckoo...", new Error("Wings were clipped!"));

// To log an Error *and* other data at the same time, use the 'error' field name
logger.error("Sad Cuckoo...", {
  error: new Error("Wings were clipped!"),
  colour: "yellow",
});
```

### Return a JavaScript `Error` after logging

When logging at levels `error` and `fatal` you can return a JavaScript `Error` that has the same message as the log record and then `throw`:

```javascript
// The message of the error thrown will be "Mission failed"
throw logger.error("Mission failed").returnError();

// You can log additional data via the second argument as per usual
throw logger
  .fatal("Mission failed", { reason: "Ran out of fuel..." })
  .returnError();
```

### Child Loggers

A child logger can be created from an existing one to specialize a logger for a sub-component of your application, i.e. to create a new logger with additional bound fields that will be included in its log records.

```javascript
const parentLogger = new Logger("parent", "debug");

// The child logger inherits the same name and log level as the parent
const childLogger = parentLogger.createChildLogger({
  subPackage: "child",
  anotherChildField: "whatever-you-want",
});

// All log records will contain the two additional fields setup at initialisation, ie: subPackage & anotherChildField
childLogger.info("Hello from child");
```

## Log Levels

Setting a logger instance to a particular level results in only log records of that level and above being written. You can configure it via the options below:

1. If not specified the logger defaults to `info` level:

```javascript
const logger = new Logger("my-package");
```

2. Set via `logLevel` constructor parameter:

```javascript
const logger = new Logger("my-package", "debug");
```

3. Set via `LOG_LEVEL` environment variable:

```javascript
// process.env.LOG_LEVEL = "debug"
const logger = new Logger("my-package");
```

The available log levels and best practices guidance on when to use them are as follows:

- `fatal` (60): The service/app is going to stop or become unusable now
- `error` (50): Fatal for a particular request, but the service/app continues servicing other requests
- `warn` (40): A note on something that should probably be looked at
- `info` (30): Detail on regular operation
- `debug` (20): Anything else, i.e. too verbose to be included in "info" level

If you want to prevent the logger from printing any messages you can set the log level to `silent`. This is sometimes useful, for example when running tests to reduce noise in the terminal.

## Log Records

The structure of log records is outlined below:

```
{
  // User supplied data
  name: "my-package",
  msg: "Hello Cuckoo!",

  ...any additional data supplied via second argument to logger methods (see examples above)

  // Record metadata (added automatically)
  logLevel: "info",
  level: 30,
  time: "2022-02-03T19:02:57.534Z",
  hostname: "banana.local",
  pid: 123,

  // AWS metadata (added automatically if applicable)
  @requestId: <id>
}
```

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sekhavati"><img src="https://avatars.githubusercontent.com/u/16732873?v=4?s=100" width="100px;" alt="Amir Sekhavati"/><br /><sub><b>Amir Sekhavati</b></sub></a><br /><a href="https://github.com/cuckoointernet/logger-nodejs/commits?author=sekhavati" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/InsungMulumba"><img src="https://avatars.githubusercontent.com/u/48129301?v=4?s=100" width="100px;" alt="Insung Mulumba"/><br /><sub><b>Insung Mulumba</b></sub></a><br /><a href="https://github.com/cuckoointernet/logger-nodejs/commits?author=InsungMulumba" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

