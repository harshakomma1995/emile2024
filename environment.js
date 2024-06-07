const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "./.env") });

let envPath;

// validate the NODE_ENV
const NODE_ENV = process.env.NODE_ENV;
switch (NODE_ENV) {
  case "development":
    envPath = path.resolve(__dirname, "./.env.development");
    break;
  case "staging":
    envPath = path.resolve(__dirname, "./.env.staging");
    break;
  case "production":
    envPath = path.resolve(__dirname, "./.env.production");
    break;
  default:
    envPath = path.resolve(__dirname, "./.env.local");
    break;
}

dotenv.config({ path: envPath });

const enviroment = {
  /* GENERAL */
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  GAME_SERVER_TOKEN: process.env.GAME_SERVER_TOKEN,
  RAZOR_KEY_ID: process.env.RAZOR_KEY_ID,
  RAZOR_KEY_SECRET: process.env.RAZOR_KEY_SECRET,
  ENCRYPION_KEY_CRYPTO: process.env.ENCRYPION_KEY_CRYPTO,
  ENCRYPION_KEY_SSO: process.env.ENCRYPION_KEY_SSO,
  MAGIC_LOGIN_SECRET_KEY: process.env.MAGIC_LOGIN_SECRET_KEY,
  SPACES_ACCESS_KEY: process.env.SPACES_ACCESS_KEY,
  SPACES_SECRET_ACCESS_KEY: process.env.SPACES_SECRET_ACCESS_KEY,
  SPACES_BUCKET_NAME: process.env.SPACES_BUCKET_NAME,
  SPACES_BUCKET_URL: process.env.SPACES_BUCKET_URL,
  SPACES_PUBLIC_ACCESS_KEY: process.env.SPACES_PUBLIC_ACCESS_KEY,
  SPACES_PUBLIC_SECRET_ACCESS_KEY: process.env.SPACES_PUBLIC_SECRET_ACCESS_KEY,
  SPACES_PUBLIC_BUCKET_NAME: process.env.SPACES_PUBLIC_BUCKET_NAME,
  SPACES_PUBLIC_BUCKET_URL: process.env.SPACES_PUBLIC_BUCKET_URL,
  SPACES_URL_EXPIRE: process.env.SPACES_URL_EXPIRE,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_HOST: process.env.REDIS_HOST,
  KMS_KEY_ID: process.env.KMS_KEY_ID
};

module.exports = enviroment;
