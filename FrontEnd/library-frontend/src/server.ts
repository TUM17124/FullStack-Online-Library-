import express from 'express';
import { join } from 'node:path';
import { AngularAppEngine, createRequestHandler } from '@angular/ssr';

const app = express();
const angularApp = new AngularAppEngine();

// Serve static files
const browserDistFolder = join(process.cwd(), 'dist/library-frontend/browser');
app.use(express.static(browserDistFolder, { index: false, maxAge: '1y' }));

// Handle SSR requests correctly
app.get('*', createRequestHandler((req) => angularApp.handle(req)));

// Start server
const port = process.env['PORT'] || 4000;
app.listen(port, () => {
  console.log(`Node Express server listening on http://localhost:${port}`);
});
