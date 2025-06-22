import { LoggerService, Injectable } from "@nestjs/common";

@Injectable()
export class MyLogger implements LoggerService {
  log(message: any, ...optionalParams: unknown[]) {
    console.log("[LOG]", message, ...optionalParams);
  }

  fatal(message: any, ...optionalParams: unknown[]) {
    console.error("[FATAL]", message, ...optionalParams);
  }

  error(message: any, ...optionalParams: unknown[]) {
    console.error("[ERROR]", message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: unknown[]) {
    console.warn("[WARN]", message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: unknown[]) {
    console.debug("[DEBUG]", message, ...optionalParams);
  }

  verbose(message: any, ...optionalParams: unknown[]) {
    console.info("[VERBOSE]", message, ...optionalParams);
  }
}
