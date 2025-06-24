import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = `Internal server error: ${request.url}`;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === "string") {
        message = res;
      } else if (typeof res === "object" && res !== null) {
        const responseObj = res as any;
        if (Array.isArray(responseObj.message)) {
          // Take the first message in the array
          message = responseObj.message[0];
        } else {
          message = responseObj.message || message;
        }
      }
    }

    // ✅ Only log for 500 errors
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      const internalErrorMessage =
        exception instanceof Error
          ? exception.message
          : JSON.stringify(exception);
      console.error(`[Internal Error] ${request.url}: ${internalErrorMessage}`);
    }
    response.status(status).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
