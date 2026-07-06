export type ConnectionState = "idle" | "connecting" | "connected" | "error";

export type DemoUser = {
  userId: string;
  displayName: string;
  role: "buyer" | "seller" | "admin";
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  attachmentId?: string;
};
