import JWT from "jsonwebtoken";

export const JwtSign = async (email, remember_me) => {
  if (!email) {
    throw new Error("Invalid Email");
  }
  const token = await JWT.sign({ email: email }, process.env.JWT_SECRET, {
    expiresIn: remember_me ? "2d" : "1d",
  });
  return token;
};
