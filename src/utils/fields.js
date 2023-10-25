import Jwt from "jsonwebtoken";
import { sendErrorResponse } from "./response.js";

export function isEmpty(fields) {
  for (const field of fields) {
    if (field === undefined || field === null || field === "") {
      return true;
    }
  }
  return false;
}
export const pinChecker = async (token, pin, modal, by) => {
  const decoded = Jwt.decode(token);
  if (!decoded?.[by]) {
    return sendErrorResponse(res, 498, "Invalid token");
  }
  const user = await modal.findOne({ email: decoded?.[by] });
  const expired = decoded.exp && decoded.exp <= Math.floor(Date.now() / 1000);
  if (!user) {
    return { code: 498, msg: "Invalid token" };
  }
  if (expired) {
    return { code: 401, msg: "Token expired" };
  }
  if (pin !== user?.confirmation_pin) {
    return { code: 400, msg: "Invalid Pin" };
  }
  return true;
};
