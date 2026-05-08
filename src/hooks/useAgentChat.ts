import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addMessage,
  setConnectionStatus,
  setThinking,
  setPendingActions,
  setError,
} from "../store/slices/chatSlice";
import { ClientPayload, ServerPayload } from "../types/chat";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000/agent/chat";

let globalSocket: WebSocket | null = null;
let isConnecting = false;

interface UseAgentChatReturn {
  sendMessage: (text: string) => void;
  confirmAction: (actionIndex: number) => void;
  selectAction: (actionIndex: number, candidateIndex: number, candidateName?: string) => void;
  clarifyAction: (actionIndex: number, text: string) => void;
  cancelActions: () => void;
}

export function useAgentChat(initConnection = false): UseAgentChatReturn {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  const connect = useCallback(() => {
    if (!token) return;
    if (globalSocket?.readyState === WebSocket.OPEN || isConnecting) return;

    isConnecting = true;
    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    globalSocket = ws;

    ws.onopen = () => {
      isConnecting = false;
      dispatch(setConnectionStatus(true));
      dispatch(setError(null));
    };

    ws.onmessage = (event) => {
      try {
        const data: ServerPayload = JSON.parse(event.data);

        switch (data.type) {
          case "INFO":
            dispatch(setThinking(false));
            dispatch(
              addMessage({
                id: Math.random().toString(36).substring(2, 11),
                sender: "agent",
                text: data.payload.message,
                timestamp: new Date().toISOString(),
              })
            );
            break;
          case "THINKING":
            dispatch(setThinking(true));
            break;
          case "ACTIONS":
            dispatch(setThinking(false));
            dispatch(setPendingActions(data.payload));
            break;
          case "RESULT":
            dispatch(setThinking(false));
            dispatch(
              addMessage({
                id: Math.random().toString(36).substring(2, 11),
                sender: "agent",
                text: data.payload.message,
                timestamp: new Date().toISOString(),
              })
            );
            dispatch(setPendingActions([]));
            break;
          case "ERROR":
            dispatch(setThinking(false));
            dispatch(setError(data.payload.message));
            dispatch(
              addMessage({
                id: Math.random().toString(36).substring(2, 11),
                sender: "agent",
                text: `Error: ${data.payload.message}`,
                timestamp: new Date().toISOString(),
              })
            );
            break;
          default:
            console.warn("Unknown message type received", data);
        }
      } catch (err) {
        console.error("Failed to parse websocket message", err);
      }
    };

    ws.onclose = () => {
      isConnecting = false;
      dispatch(setConnectionStatus(false));
      globalSocket = null;
    };

    ws.onerror = (error) => {
      isConnecting = false;
      console.error("WebSocket error:", error);
      dispatch(setError("WebSocket connection error"));
      dispatch(setConnectionStatus(false));
    };
  }, [token, dispatch]);

  const disconnect = useCallback(() => {
    if (globalSocket) {
      globalSocket.close();
      globalSocket = null;
    }
  }, []);

  useEffect(() => {
    if (initConnection && token) {
      connect();
    }
    return () => {
      if (initConnection) {
        disconnect();
      }
    };
  }, [initConnection, token, connect, disconnect]);

  const sendPayload = useCallback(
    (payload: ClientPayload) => {
      if (globalSocket?.readyState === WebSocket.OPEN) {
        globalSocket.send(JSON.stringify(payload));
      } else {
        console.error("WebSocket is not connected");
        dispatch(setError("No hay conexión con el asistente."));
      }
    },
    [dispatch]
  );

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      dispatch(
        addMessage({
          id: Math.random().toString(36).substring(2, 11),
          sender: "user",
          text,
          timestamp: new Date().toISOString(),
        })
      );
      dispatch(setThinking(true));
      sendPayload({ type: "MESSAGE", payload: { text } });
    },
    [dispatch, sendPayload]
  );

  const confirmAction = useCallback(
    (actionIndex: number) => {
      dispatch(
        addMessage({
          id: Math.random().toString(36).substring(2, 11),
          sender: "user",
          text: "Confirmar acción",
          timestamp: new Date().toISOString(),
        })
      );
      dispatch(setThinking(true));
      dispatch(setPendingActions([]));
      sendPayload({ type: "CONFIRM", payload: { actionIndex } });
    },
    [dispatch, sendPayload]
  );

  const selectAction = useCallback(
    (actionIndex: number, candidateIndex: number, candidateName?: string) => {
      dispatch(
        addMessage({
          id: Math.random().toString(36).substring(2, 11),
          sender: "user",
          text: `Seleccioné: ${candidateName || `Opción ${candidateIndex + 1}`}`,
          timestamp: new Date().toISOString(),
        })
      );
      dispatch(setThinking(true));
      dispatch(setPendingActions([]));
      sendPayload({ type: "SELECT", payload: { actionIndex, candidateIndex } });
    },
    [dispatch, sendPayload]
  );

  const clarifyAction = useCallback(
    (actionIndex: number, text: string) => {
      dispatch(setThinking(true));
      dispatch(setPendingActions([]));
      sendPayload({ type: "CLARIFY", payload: { actionIndex, text } });
    },
    [dispatch, sendPayload]
  );

  const cancelActions = useCallback(() => {
    dispatch(
        addMessage({
          id: Math.random().toString(36).substring(2, 11),
          sender: "user",
          text: "Cancelar acción",
          timestamp: new Date().toISOString(),
        })
    );
    dispatch(setPendingActions([]));
    sendPayload({ type: "CANCEL" });
  }, [dispatch, sendPayload]);

  return {
    sendMessage,
    confirmAction,
    selectAction,
    clarifyAction,
    cancelActions,
  };
}

