import { useEffect, useRef, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useAppSelector } from "../../store/store";

interface WebSocketMessage {
  data: string;
  timeStamp: number;
}

export const useWebSocketConnection = () => {
  const { isAuthenticated, token } = useAppSelector((state) => state.user);
  const [messageHistory, setMessageHistory] = useState<WebSocketMessage[]>([]);
  const [latestMessage, setLatestMessage] = useState<any>(null);
  const authSentRef = useRef(false);

  const socketUrl =
    document.location.hostname === "localhost"
      ? "wss://test.wmsonline.in/ws/"
      : document.location.origin.replace("http", "ws") + "/ws/";

  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    isAuthenticated ? socketUrl : null,
    {
      onOpen: () => console.log("WebSocket connection established."),
      onClose: () => console.log("WebSocket connection closed."),
      onError: (event) => console.error("WebSocket error:", event),
      shouldReconnect: () => {
        return isAuthenticated;
      },
      reconnectAttempts: 10,
      reconnectInterval: 3000,
    },
  );

  useEffect(() => {
    const ws = getWebSocket();
    if (ws && readyState === ReadyState.OPEN) {
      const handleMessage = (event: Event) => {
        const messageEvent = event as MessageEvent;
        console.log(
          "WebSocket message received:",
          JSON.parse(messageEvent.data),
        );

        if (!authSentRef.current) {
          const jwtToken = token || localStorage.getItem("accessToken");
          if (jwtToken) {
            const authMessage = JSON.stringify({
              type: "auth",
              data: {
                token: jwtToken,
              },
            });
            sendMessage(authMessage);
            authSentRef.current = true;
            console.log("Authentication message sent:", authMessage);
          }
        }
      };

      ws.addEventListener("message", handleMessage);

      return () => {
        ws.removeEventListener("message", handleMessage);
        authSentRef.current = false;
      };
    } else {
      authSentRef.current = false;
    }
  }, [readyState, getWebSocket, sendMessage, token]);

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const parsedMessage = JSON.parse(lastMessage.data);
        console.log("WebSocket message (via hook):", parsedMessage);
        setLatestMessage(parsedMessage);
        setMessageHistory((prev) => [...prev, parsedMessage]);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        setLatestMessage(null);
      }
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
    latestMessage,
    connectionStatus,
    readyState,
    isConnected: readyState === ReadyState.OPEN,
  };
};
