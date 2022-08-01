import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import Store from "./store/store";

interface IStore {
  store: Store;
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
// Создаем хранилище MOBX
const store = new Store();
// Создаем реакт контекст чтобы с помощью хука useContext получить доступ к хранилищу
export const Context = React.createContext<IStore>({
  store,
});

root.render(
  <Context.Provider value={{ store }}>
    <App />
  </Context.Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
