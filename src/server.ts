import { app } from './app'
import './queue/attachment-scan.worker'
import './queue/attachment-delete.worker'

app.listen(3333);
console.log(`🦊 Elysia running at http://localhost:3333`);
