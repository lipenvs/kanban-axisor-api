import { RedisClient } from 'bun';
import { env } from '../../env';
import type { ElysiaWS } from 'elysia/dist/ws';

const clients = new Map<string, Set<ElysiaWS>>();

const subscriber = new RedisClient(env.REDIS_URL);

await subscriber.subscribe('notifications', (message) => {
  const payload = JSON.parse(message);
  
  const projectClients = clients.get(payload.projectId);
  if (projectClients) {
    for (const ws of projectClients) {
      ws.send(JSON.stringify(payload));
    }
  }
});

export const wsService = {
  register(projectId: string, ws: ElysiaWS) {
    if (!clients.has(projectId)) {
      clients.set(projectId, new Set());
    }
    clients.get(projectId)!.add(ws);
  },
  unregister(projectId: string, ws: ElysiaWS) {
    const projectClients = clients.get(projectId);
    if (projectClients) {
      projectClients.delete(ws);
      if (projectClients.size === 0) {
        clients.delete(projectId);
      }
    }
  },
};