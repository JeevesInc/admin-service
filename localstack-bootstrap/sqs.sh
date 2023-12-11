#!/usr/bin/env bash

set -xe

AWS_REGION=us-east-2

EXAMPLE_PROCESS_QUEUE_URL=local_example_process
EXAMPLE_PROCESS_DEAD_LETTER_QUEUE_URL=local_example_process_dead-letter-queue

awslocal sqs create-queue --queue-name $EXAMPLE_PROCESS_DEAD_LETTER_QUEUE_URL --attributes "ReceiveMessageWaitTimeSeconds=1,VisibilityTimeout=20"

EXAMPLE_PROCESS_QUEUE_ATTRIBUTES='{"deadLetterTargetArn":"arn:aws:sqs:us-east-2:000000000000:local_example_process_dead-letter-queue","maxReceiveCount":"3"}'
awslocal sqs create-queue --queue-name $EXAMPLE_PROCESS_QUEUE_URL --region ${AWS_REGION} --attributes $EXAMPLE_PROCESS_QUEUE_ATTRIBUTES

awslocal sqs list-queues --region ${AWS_REGION}
