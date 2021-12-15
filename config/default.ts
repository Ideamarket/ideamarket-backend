import mongoUriBuilder from "mongo-uri-builder";

export default {
  server: {
    port: process.env.PORT || 3300,
  },
  mongodb: {
    uri:
      process.env.MONGODB_URI ||
      mongoUriBuilder({
        username: process.env.MONGODB_USERNAME || undefined,
        password: process.env.MONGODB_PASSWORD || undefined,
        host: process.env.MONGODB_HOST || "localhost",
        port: Number.parseInt(process.env.MONGODB_PORT || "27017"),
        database: process.env.MONGODB_DATABASE || "ideamarket",
      }),
  },
};
