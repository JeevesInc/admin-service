import AWS from 'aws-sdk';
import config from 'config';
import { Consumer } from 'sqs-consumer';
import { getLogger } from '@jeevesinc/jeeves-telemetry';

const logger = getLogger();

export const exampleConsumer = Consumer.create({
  queueUrl: config.get<string>('mq.EXAMPLE_PROCESS_QUEUE_URL'),
  handleMessage: async (message) => {
    // create your handler funtion and call it from here...
    logger.info(message.Body);
  },
  sqs: new AWS.SQS({
    endpoint: config.get<string>('aws.AWS_ENDPOINT'),
    region: config.get<string>('aws.AWS_DEFAULT_REGION'),
  }),
});

exampleConsumer.on('error', (error) => {
  logger.error(error, 'processing_error in exampleConsumer');
});

exampleConsumer.on('processing_error', (error) => {
  logger.error(error, 'processing_error in exampleConsumer');
});
