import { Elysia } from "elysia";
import { auth } from "../modules/better-auth/service";

interface WebSocketConnection {
  userId: string;
  ws: {
    readonly id: string;
    data: {
      headers: Record<string, string | undefined>;
    };
    readyState: number;
    send: (message: string) => void;
    close: (code?: number, reason?: string) => void;
  };
}

interface AttachmentScanningEvent {
  attachmentId: string;
  taskId: string;
  fileName: string;
}

interface AttachmentSavingEvent {
  attachmentId: string;
  taskId: string;
  fileName: string;
}

interface AttachmentCompletedEvent {
  attachmentId: string;
  taskId: string;
  fileName: string;
  status: string;
  attachmentCount: number;
}

interface WebSocketMessage {
  event: string;
  data: AttachmentScanningEvent | AttachmentSavingEvent | AttachmentCompletedEvent | Record<string, unknown>;
}

const connections = new Map<string, Set<WebSocketConnection>>();

export function broadcastToUser(userId: string, event: string, data: AttachmentScanningEvent | AttachmentSavingEvent | AttachmentCompletedEvent): void {
  const userConnections = connections.get(userId);
  if (!userConnections) return;

  const message: WebSocketMessage = { event, data };
  const messageString = JSON.stringify(message);
  userConnections.forEach((conn) => {
    try {
      if (conn.ws.readyState === 1) {
        conn.ws.send(messageString);
      }
    } catch (error) {
      console.error("Error sending WebSocket message:", error);
    }
  });
}

export function broadcastToTask(taskId: string, event: string, data: AttachmentScanningEvent | AttachmentSavingEvent | AttachmentCompletedEvent): void {
  const message: WebSocketMessage = { event, data };
  const messageString = JSON.stringify(message);
  connections.forEach((userConnections) => {
    userConnections.forEach((conn) => {
      try {
        if (conn.ws.readyState === 1) {
          conn.ws.send(messageString);
        }
      } catch (error) {
        console.error("Error sending WebSocket message:", error);
      }
    });
  });
}

interface PingMessage {
  event: "ping";
}

interface PongMessage {
  event: "pong";
  data: Record<string, never>;
}

export const websocketController = new Elysia({ prefix: "/ws" })
  .ws("/", {
    async open(ws) {
      const headers = new Headers();
      Object.entries(ws.data.headers).forEach(([key, value]) => {
        if (value) {
          headers.set(key, value);
        }
      });
      const session = await auth.api.getSession({ headers });
      if (!session?.user?.id) {
        ws.close(1008, "Unauthorized");
        return;
      }

      const userId = session.user.id;
      if (!connections.has(userId)) {
        connections.set(userId, new Set());
      }

      const connection: WebSocketConnection = {
        userId,
        ws,
      };

      connections.get(userId)!.add(connection);

      const connectedMessage: WebSocketMessage = {
        event: "connected",
        data: { userId },
      };
      ws.send(JSON.stringify(connectedMessage));
    },
    async close(ws) {
      const headers = new Headers();
      Object.entries(ws.data.headers).forEach(([key, value]) => {
        if (value) {
          headers.set(key, value);
        }
      });
      const session = await auth.api.getSession({ headers });
      if (!session?.user?.id) return;

      const userId = session.user.id;
      const userConnections = connections.get(userId);
      if (userConnections) {
        userConnections.forEach((conn) => {
          if (conn.ws === ws) {
            userConnections.delete(conn);
          }
        });

        if (userConnections.size === 0) {
          connections.delete(userId);
        }
      }
    },
    message(ws, message) {
      try {
        const data: PingMessage = typeof message === "string" ? JSON.parse(message) : message;
        if (data.event === "ping") {
          const pongMessage: PongMessage = { event: "pong", data: {} };
          ws.send(JSON.stringify(pongMessage));
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    },
  });
