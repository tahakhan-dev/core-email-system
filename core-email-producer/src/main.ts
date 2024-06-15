import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import { join } from 'path';

async function bootstrap() {
  const APP_PORT = process.env.PORT;

  const server = express();

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server)
    , {
      snapshot: true, // This will instruct the framework to collect necessary metadata that will let Nest Devtools visualize your application's graph.
      abortOnError: false,
    }
  );

  server.set('view engine', 'ejs');
  server.set('views', join(__dirname, 'views')); // Make sure this points to the right directory
  server.use(express.static(__dirname + '/public'));

  // Enable CORS
  app.use(cors());
  app.use(helmet());


  app.enableVersioning({
    type: VersioningType.HEADER,
    header: 'X-API-Version', // Set the header key as 'X-API-Version'
  });

  app.useGlobalPipes(
    // Here, we are setting transform to true to enable automatic data transformation and whitelist to true to strip any properties that are not decorated with validation decorators
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.setGlobalPrefix(process.env.GLOABAL_API_PREFIX);

  // This function enables the automatic handling of shutdown signals or events by registering shutdown hooks in the application.
  app.enableShutdownHooks();

  await app.listen(APP_PORT, () => {
    console.log(`APP IS RUNNING ON ${APP_PORT}`);
  });
}
bootstrap()
