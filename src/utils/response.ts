import { Response } from "express";
export const sendErrorResponse = (
  res: Response,
  code: number = 400,
  errorMessage: string
) => {
  return res.status(code).send({
    status: "error",
    error: errorMessage,
  });
};

export const sendSuccessResponse = (
  res: Response,
  code: number,
  data: any,
  message: string = "Successfull"
) => {
  return res.status(code).send({
    status: "success",
    data,
    message,
  });
};
export const appErrorResponse = (res: Response, err: any) => {
  console.log("err", `${err}`);
  return sendErrorResponse(res, 500, "Sever Error");
};
export const missingFeilds = (res: Response) => {
  return sendErrorResponse(res, 400, "Some feilds are missings");
};
