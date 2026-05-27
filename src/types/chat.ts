export type Sender = "user" | "agent";

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  timestamp: string;
}

// Client -> Server
export interface ClientMessagePayload {
  type: "MESSAGE";
  payload: { text: string };
}

export interface ClientConfirmPayload {
  type: "CONFIRM";
  payload: { actionIndex: number };
}

export interface ClientSelectPayload {
  type: "SELECT";
  payload: { actionIndex: number; candidateIndex: number };
}

export interface ClientClarifyPayload {
  type: "CLARIFY";
  payload: { actionIndex: number; text: string };
}

export interface ClientCancelPayload {
  type: "CANCEL";
}

export type ClientPayload =
  | ClientMessagePayload
  | ClientConfirmPayload
  | ClientSelectPayload
  | ClientClarifyPayload
  | ClientCancelPayload;

// Server -> Client
export interface ActionCandidate {
  name?: string;
  title?: string;
  description?: string;
  [key: string]: unknown; 
}

export interface ResolvedAction {
    status?: "AMBIGUOUS" | "PENDING" | "READY" | string;
    description?: string;
    question?: string;
    candidates?: ActionCandidate[];
    [key: string]: unknown;
}

export interface ServerInfoPayload {
  type: "INFO";
  payload: { message: string };
}

export interface ServerThinkingPayload {
  type: "THINKING";
  payload?: unknown;
}

export interface ServerActionsPayload {
  type: "ACTIONS";
  payload: ResolvedAction[];
}

export interface ServerResultPayload {
  type: "RESULT";
  payload: { actionIndex: number; message: string };
}

export interface ServerErrorPayload {
  type: "ERROR";
  payload: { message: string };
}

export type ServerPayload =
  | ServerInfoPayload
  | ServerThinkingPayload
  | ServerActionsPayload
  | ServerResultPayload
  | ServerErrorPayload;
