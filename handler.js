const { SQS, SNS } = require("aws-sdk");

const sqs = new SQS();
const sns = new SNS({region: 'us-east-1'});

const producer = async (event) => {
  let statusCode = 200;
  let message;

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "No body was found",
      }),
    };
  }

  try {
    await sqs
      .sendMessage({
        QueueUrl: process.env.QUEUE_URL,
        MessageBody: event.body,
        MessageAttributes: {
          AttributeName: {
            StringValue: "Attribute Value",
            DataType: "String",
          },
        },
      })
      .promise();

    message = "Message accepted!";
  } catch (error) {
    console.log(error);
    message = error;
    statusCode = 500;
  }

  return {
    statusCode,
    body: JSON.stringify({
      message,
    }),
  };
};

const consumer = async (event) => {
  for (const record of event.Records) {
    const messageAttributes = record.messageAttributes;
    //console.log(
      //"Message Attributte: ",
      //messageAttributes.AttributeName.stringValue
    //);
    console.log("Message Body: ", record.body);
    try {
      await sns.publish({
        Message: record.body,
        TopicArn: `arn:aws:sns:${process.env.region}:${process.env.accountId}:${process.env.service}-${process.env.stage}-fanout-sns-topic`
//arn:aws:sns:us-east-1:400634306222:aws-node-sqs-worker-dev-devfanout-sns-topic
      }).promise()
    } catch (error) {
      console.log(error);
    }

  }
};

// for demo
const fanoutConsumer = async (event) => {
  for (const record of event.Records) {
    const messageAttributes = record.messageAttributes;
    console.log("Consumer 1: ", record.body);
  }
};

// for demo
const fanoutConsumer2 = async (event) => {
  for (const record of event.Records) {
    const messageAttributes = record.messageAttributes;
    console.log("Consumer 2: ", record.body);
  }
};

module.exports = {
  producer,
  consumer,
  fanoutConsumer,
  fanoutConsumer2
};
