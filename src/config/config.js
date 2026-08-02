import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/event-platform',
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me'
};

export default config;
