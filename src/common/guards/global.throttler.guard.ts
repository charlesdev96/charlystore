import { Injectable } from "@nestjs/common";
import { ThrottlerException, ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class GlobalThrottlerMessage extends ThrottlerGuard {
  // eslint-disable-next-line @typescript-eslint/require-await
  protected async throwThrottlingException(): Promise<void> {
    throw new ThrottlerException(
      "🛑 You are sending too many requests. Please wait some minutes before trying again.",
    );
  }
}
