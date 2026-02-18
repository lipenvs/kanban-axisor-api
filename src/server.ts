import { app } from './app';
import './queue/attachment-worker';

app.listen(3333);
console.log(`🦊 Elysia running at http://localhost:3333`);
