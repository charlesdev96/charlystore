import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { AllExceptionsFilter } from "./common/filters/globalErrorFilter.filter";
import helmet from "helmet";
import * as compression from "compression";
import { TimeOutInterceptor } from "./common/interceptors";
// import { MyLogger } from "./common/logger/logger";

async function bootstrap(): Promise<void> {
  // const app = await NestFactory.create(AppModule, {
  //   logger: new MyLogger(),
  // });
  const app = await NestFactory.create(AppModule, {
    logger: ["log", "fatal", "error", "warn", "debug", "verbose"],
  });
  app.use(helmet());
  app.enableCors({
    origin: "*", // or specify trusted origins
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  });
  app.use(compression());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //strips properties that dont have decorators
      forbidNonWhitelisted: true,
      transform: true, //automatically transform payloads to be objects types according to their dto  classes
      disableErrorMessages: false,
    }),
  );
  //global error catch
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TimeOutInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
