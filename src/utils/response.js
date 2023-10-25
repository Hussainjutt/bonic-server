export const sendErrorResponse = (res, code = 400, errorMessage) => {
  return res.status(code).send({
    status: "error",
    error: errorMessage,
  });
};

export const sendSuccessResponse = (
  res,
  code,
  data,
  message = "Successfull"
) => {
  return res.status(code).send({
    status: "success",
    data,
    message,
  });
};
export const appErrorResponse = (res, err) => {
  return sendErrorResponse(res, 500, err?.message ?? "Sever Error");
};
export const missingFeilds = (res) => {
  return sendErrorResponse(res, 400, "Some feilds are missings");
};
