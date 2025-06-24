import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from "@nestjs/common";
import { seconds } from "@nestjs/throttler";
import { catchError, Observable, throwError, timeout } from "rxjs";

@Injectable()
export class TimeOutInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      timeout(seconds(45)),
      catchError((err) => {
        if (err.name === "TimeoutError") {
          return throwError(
            () =>
              new RequestTimeoutException(
                "⏳ Request took too long. Please try again later and check your internet settings.",
              ),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
