import { Injectable, NestMiddleware } from "@nestjs/common";
import * as kleur from "kleur";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const method = kleur.green(req.method);
    const url = kleur.blue(req.originalUrl);
    const time = kleur.yellow(new Date().toLocaleString());
    console.log(`${kleur.bgGreen("[Request]")} ${method} ${url} - ${time}`);
    // console.log("Request called....");
    next();
  }
}
