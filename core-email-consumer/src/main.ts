import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import helmet from 'helmet';
const cluster = require("cluster")
import * as os from 'os';
import 'dotenv/config';


async function bootstrap() {
  const APP_PORT = process.env.PORT;

  const app = await NestFactory.create(AppModule, {
    snapshot: true, // This will instruct the framework to collect necessary metadata that will let Nest Devtools visualize your application's graph.
    abortOnError: false,
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER_IP], // Your Kafka broker(s)
      },
      consumer: {
        groupId: process.env.KAFKA_GROUP_ID, // Unique group ID for your application
      },
    },
  });

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

  await app.startAllMicroservices();
  await app.listen(APP_PORT, () => {
    console.log(`APP IS RUNNING ON ${APP_PORT}`);
  });
}

if (cluster.isMaster) {
  const numWorkers = 3; // Number of workers you want to run
  console.log(`Master cluster setting up ${numWorkers} workers...`);

  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }

  cluster.on('online', (worker) => {
    console.log(`Worker ${worker.process.pid} is online`);
  });

  cluster.on('exit', (worker, code, signal) => {
    console.log(
      `Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`
    );
    console.log('Starting a new worker');
    cluster.fork();
  });
} else {
  bootstrap();
}
