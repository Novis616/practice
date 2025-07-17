import { useState, useEffect } from "react";

function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showNotification) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "10px 20px",
        borderRadius: "5px",
        color: "white",
        backgroundColor: isOnline ? "#4CAF50" : "#f44336",
        zIndex: 1000,
        transition: "all 0.3s ease",
      }}
    >
      {isOnline ? "✅ Соединение восстановлено" : "❌ Нет подключения к интернету"}
    </div>
  );
}

export default NetworkStatus;
