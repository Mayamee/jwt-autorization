import UserModel from "../models/user.model.js";
import MailService from "./mail.service.js";
import TokenService from "./token.service.js";
//Добавили DTO чтобы убрать лишние поля из модели
import UserDto from "../dtos/user.dto.js";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import ApiError from "../error/ApiError.js";

class UserService {
  async registration(email, password) {
    // убедитесь, что пользователь не существует
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest(
        `Пользователь с email: ${email} уже существует`
      );
    }
    // хешируем пароль (data, saltRounds)
    const hashedPassword = await bcrypt.hash(password, 10);
    // создаем уникальный линк для активации
    const activationLink = uuid();
    // создаем нового пользователя
    const user = await UserModel.create({
      email,
      password: hashedPassword,
      activationLink,
    });
    // отправляем письмо пользователю со ссылкой для активации
    await MailService.sendActivationMail(email, activationLink);
    // генерируем токены
    const userDto = new UserDto(user); // id email isActivated
    const tokens = TokenService.generateToken({
      ...userDto,
    });
    // сохраняем токены в базе
    await TokenService.saveToken(userDto.id, tokens.refreshToken);
    return {
      user: userDto,
      ...tokens,
    };
  }
  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequest("Пользователь не найден");
    }
    user.activated = true;
    await user.save();
  }
  async login(email, password) {
    // ищем пользователя по email
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw ApiError.BadRequest("Пользователь не найден");
    }
    // проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.BadRequest("Неверный пароль");
    }
    // создаем дто пользователя
    const userDto = new UserDto(user);
    // генерируем токены
    const tokens = TokenService.generateToken({
      ...userDto,
    });
    // сохраняем refresh token в базе
    await TokenService.saveToken(userDto.id, tokens.refreshToken);
    return {
      user: userDto,
      ...tokens,
    };
  }
  async logout(refreshToken) {
    // удаляем refresh token из базы
    return await TokenService.removeToken(refreshToken);
  }
  async refresh(refreshToken) {
    // если refresh token не найден, бросаем ошибку
    if (!refreshToken) {
      throw ApiError.Unauthorized();
    }
    // проверяем переданный токен на валидность, если валиден получаем наш payload из него который содержит id пользователя
    const tokenData = TokenService.validateRefreshToken(refreshToken);
    // ищем токен в базе данных
    const tokenFromDB = await TokenService.findToken(refreshToken);
    // если токен не найден или не валиден, бросаем ошибку
    if (!tokenData || !tokenFromDB) {
      throw ApiError.Unauthorized();
    }
    // достаем id пользователя из payload
    const user = await UserModel.findById(tokenData.id);
    const userDto = new UserDto(user);
    // генерируем токены
    const tokens = TokenService.generateToken({
      ...userDto,
    });
    // сохраняем refresh token в базе
    await TokenService.saveToken(userDto.id, tokens.refreshToken);
    return {
      user: userDto,
      ...tokens,
    };
  }
  async getAllUsers() {
    const users = await UserModel.find();
    return users.map((user) => new UserDto(user));
  }
}

export default new UserService();
