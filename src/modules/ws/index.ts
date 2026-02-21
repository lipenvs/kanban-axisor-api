import { Elysia } from 'elysia';
import { wsService } from './service';

export const wsController = new Elysia()
  .ws('/ws', {
    detail: { hide: true },
    open(ws) {
      const projectId = ws.data.query.projectId;
      if (projectId) {
        wsService.register(projectId, ws);
      }
    },
    close(ws) {
      const projectId = ws.data.query.projectId;
      if (projectId) {
        wsService.unregister(projectId, ws);
      }
    },
    message() {},
  });