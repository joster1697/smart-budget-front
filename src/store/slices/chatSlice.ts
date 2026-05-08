import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatMessage, ResolvedAction } from "../../types/chat";

interface ChatState {
  messages: ChatMessage[];
  isConnected: boolean;
  isThinking: boolean;
  pendingActions: ResolvedAction[];
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  isConnected: false,
  isThinking: false,
  pendingActions: [],
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      if (!action.payload) {
        state.isThinking = false;
      }
    },
    setThinking: (state, action: PayloadAction<boolean>) => {
      state.isThinking = action.payload;
    },
    setPendingActions: (state, action: PayloadAction<ResolvedAction[]>) => {
      state.pendingActions = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
      state.pendingActions = [];
      state.isThinking = false;
      state.error = null;
    },
  },
});

export const {
  addMessage,
  setConnectionStatus,
  setThinking,
  setPendingActions,
  setError,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;
