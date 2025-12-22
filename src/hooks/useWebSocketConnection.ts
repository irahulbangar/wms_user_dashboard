import { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useAppSelector } from "../../store/store";

interface WebSocketMessage {
  data: string;
  timeStamp: number;
}

export const useWebSocketConnection = () => {
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const [messageHistory, setMessageHistory] = useState<WebSocketMessage[]>([]);

  const socketUrl = document.location.hostname === "localhost" ? "wss://test.wmsonline.in/ws/" : document.location.origin.replace("http", "ws") + "/ws/";

  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    isAuthenticated ? socketUrl : null,
    {
      onOpen: () => console.log("WebSocket connection established."),
      onClose: () => console.log("WebSocket connection closed."),
      onError: (event) => console.error("WebSocket error:", event),
      shouldReconnect: (_closeEvent) => {
        return isAuthenticated;
      },
      reconnectAttempts: 10,
      reconnectInterval: 3000,
    }
  );

  useEffect(() => {
    const ws = getWebSocket();
    if (ws && readyState === ReadyState.OPEN) {
      const handleMessage = (event: Event) => {
        const messageEvent = event as MessageEvent;
        console.log("WebSocket message received:", messageEvent.data);
      };

      ws.addEventListener("message", handleMessage);

      return () => {
        ws.removeEventListener("message", handleMessage);
      };
    }
  }, [readyState, getWebSocket]);

  useEffect(() => {
    if (lastMessage !== null) {
      console.log("WebSocket message (via hook):", lastMessage.data);
      setMessageHistory((prev) => [...prev, lastMessage]);
    }
  }, [lastMessage]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  const handleSendMessage = (message: string) => {
    if (readyState === ReadyState.OPEN) {
      sendMessage(message);
    }
  };

  return {
    sendMessage: handleSendMessage,
    messageHistory,
    connectionStatus,
    readyState,
    isConnected: readyState === ReadyState.OPEN,
  };
};
