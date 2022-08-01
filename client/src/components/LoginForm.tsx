import { observer } from "mobx-react-lite";
import { FC, useContext, useState } from "react";
import { Context } from "../index";

interface LoginFormProps {}

const LoginForm: FC<LoginFormProps> = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { store } = useContext(Context);

  return (
    <div>
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={() => {
          store.login(email, password);
        }}
      >
        Логин
      </button>
      <button
        onClick={() => {
          store.registration(email, password);
        }}
      >
        Регистрация
      </button>
    </div>
  );
};

export default observer(LoginForm);
