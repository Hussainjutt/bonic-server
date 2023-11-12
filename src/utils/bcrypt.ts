import bcrypt from "bcrypt";

export const hashPassword = async (password: string): Promise<string> => {
  try {
    const saltRound = 10;
    const hashPassword = await bcrypt.hash(password, saltRound);
    return hashPassword;
  } catch (error) {
    throw error;
  }
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<null | boolean> => {
  try {
    if (!password || !hashedPassword) {
      return null;
    }
    return bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw error;
  }
};
