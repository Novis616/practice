import React from "react";
import "./App.css";
import NetworkStatus from "./components/NetworkStatus";
import { useNetworkStatus } from "./hooks/useNetworkStatus";

function App() {
  const isOnline = useNetworkStatus();

  return (
    <div className="App">
      <NetworkStatus />

      {!isOnline && (
        <div
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            color: "#856404",
            padding: "10px",
            textAlign: "center",
          }}
        >
          Вы работаете в офлайн-режиме. Некоторые функции могут быть недоступны.
        </div>
      )}

      <header>
        <h1>Мое PWA приложение</h1>
        <p>Статус сети: {isOnline ? "🟢 Онлайн" : "🔴 Офлайн"}</p>
      </header>

      <main>
        <p>Содержимое вашего приложения</p>
      </main>
    </div>
  );
}

export default App;
