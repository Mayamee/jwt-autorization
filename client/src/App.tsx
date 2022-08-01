import React, { useState, useContext, useEffect } from "react";
import { Context } from "./index";
import "./App.scss";
import LoginForm from "./components/LoginForm";
import { observer } from "mobx-react-lite";
import UserService from "./services/UserSevice";
import { IUser } from "./models/IUser";

function App() {
  const [users, setUsers] = useState<IUser[]>([]);
  const { store } = useContext(Context);
  useEffect(() => {
    if (localStorage.getItem("token")) {
      store.checkAuth();
    }
  }, []);

  const getUsers = async () => {
    try {
      const response = await UserService.fetchUsers();
      setUsers(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  if (store.isLoading) {
    return <div>Loading...</div>;
  }

  if (!store.isAuth) {
    return (
      <>
        <LoginForm />
        <button onClick={getUsers}>Получить список пользователей</button>
      </>
    );
  }

  return (
    <div className="App">
      <h1>Привет, {store.user.email}</h1>
      <h2>
        {store.user.isActivated
          ? `Аккаунт подтвержден по почте: ${store.user.email}`
          : `Аккаунт: ${store.user.email} не подтвержден по почте`}
      </h2>
      <h2>{"Пользователь авторизован: " + store.user.email}</h2>
      <button
        onClick={() => {
          setUsers([]);
          store.logout();
        }}
      >
        Выйти
      </button>

      <div className="UserList">
        {users.length > 0 ? (
          <>
            <h2>Список пользователей</h2>
            <ul>
              {users.map((user, index) => {
                return <li key={index}>{user.email}</li>;
              })}
            </ul>
          </>
        ) : null}
        <button onClick={getUsers}>Получить список пользователей</button>
      </div>
    </div>
  );
}

export default observer(App);
