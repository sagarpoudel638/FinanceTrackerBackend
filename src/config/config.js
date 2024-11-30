//import "dotenv/config";

export const config = {
  port: process.env.PORT || "9000",
  mongodb: {
    url: process.env.MONGODB_URL ,
  },
  jwtSecret: process.env.JWT_SECRET || "secret",
  jwtExpire: process.env.JWT_EXPIRE || "1d",
};
