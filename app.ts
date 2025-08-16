// Load environment variables first, before any other imports
require('dotenv').config();

import createError from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';

import { testConnection } from './db';
import { defineMoviesRoutes } from './entities/movies/movies.routes';

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Configure CORS to allow requests from frontend
const allowedOrigins: string[] = [
  'http://localhost:3000',
  'http://localhost:5173',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []) // Add env var if defined
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

testConnection()

defineMoviesRoutes(app)

// catch 404 and forward to error handler
app.use(function(req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});

// error handler
app.use(function(err: any, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
