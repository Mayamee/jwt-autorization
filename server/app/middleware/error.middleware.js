import ApiError from "../error/ApiError.js";

export default function errorMiddleware(err, req, res, next) {
  if (err instanceof ApiError) {
    res.status(err.status).json({ message: err.message, errors: err.errors });
  } else {
    res.status(500).json({ message: err.message });
  }
}
