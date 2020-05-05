import 'dotenv/config';

import express from 'express';
import path from 'path';
import cors from 'cors';
import * as Sentry from '@sentry/node';
import Youch from 'youch';

import sentryConfig from './config/sentry';

import 'express-async-errors';
// import './database';

import routes from './routes';

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(cors());
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(
      '/',
      express.static(path.resolve(__dirname, '..', 'public'))
    );
    this.server.use('/video', (req, res) =>
      res.redirect('https://www.youtube.com/watch?v=afc9bjcQdXI')
    );
    this.server.use('/globohub', (req, res) =>
      res.sendFile(path.resolve(__dirname, '..', 'public', 'app.apk'))
    );

    this.server.use('/api', routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    this.server.use(async (error, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(error, req).toJSON();

        return res.status(500).json(errors);
      }

      return res.status(500).json({ error: 'Internal server error' });
    });
  }
}

export default new App().server;
