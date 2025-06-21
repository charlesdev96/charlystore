import { Controller, All, Req, Res, NotFoundException } from "@nestjs/common";
import { Request, Response } from "express";

@Controller("*")
export class NotFoundController {
  @All()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleNotFound(@Req() req: Request, @Res() res: Response) {
    throw new NotFoundException({
      success: false,
      message: `Opps!. It seems like the route you selected does not exist. Please choose another route or contact support for assistance...`,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  }
}
