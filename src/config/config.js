import "dotenv/config";

export const config = {
  port: process.env.PORT || "9000",
  mongodb: {
    url: process.env.MONGODB_URL || "mongodb://localhost:27017/financetrackerdb",
  },
};
