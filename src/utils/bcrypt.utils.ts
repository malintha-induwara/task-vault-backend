import bcrypt from "bcrypt";

export const hashData = async (data: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(data, salt);
};

export const compareData = async (plainData: string, hashedData: string): Promise<boolean> => {
  return bcrypt.compare(plainData, hashedData);
};
