import axios from "axios";
import { AuthResponse } from "../models/response/AuthResponse";
export const API_URL = "http://localhost:8080/api";
const $api = axios.create({
  withCredentials: true,
  baseURL: API_URL,
});

$api.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
  return config;
});

$api.interceptors.response.use(
  (config) => {
    return config;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // чтобы избежать зацикливания при повторной попытке авторизации добавили флаг обработки
      originalRequest._retry = true;
      try {
        // если не авторизован, то пробуем получить новый accessToken
        const response = await axios.get<AuthResponse>(`${API_URL}/refresh`, {
          withCredentials: true,
        });
        // записываем новый accessToken в localStorage
        localStorage.setItem("token", response.data.accessToken);
        console.log("Original request: ", originalRequest);
        // повторяем запрос пользователя
        return $api.request(originalRequest);
      } catch (error) {
        // если не удалось получить новый accessToken, то перенаправляем на страницу авторизации
        console.log("Not authorized");
      }
    }
    throw error;
  }
);

export default $api;
//withcredentials: автоматически отправляет заголовок с данными авторизации
// https://youtu.be/fN25fMQZ2v0?t=4508 объясняет что такое interceptor
