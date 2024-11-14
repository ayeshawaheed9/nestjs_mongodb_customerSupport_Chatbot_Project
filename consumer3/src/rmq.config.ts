import amqp from 'amqp-connection-manager';

export async function createRmqConnection() {
  const connection = amqp.connect(['amqp://localhost:5672']);

  connection.on('connect', () => console.log('Connected to RabbitMQ'));
  connection.on('disconnect', (err) =>
    console.error('Disconnected from RabbitMQ:', err),
  );
  connection.on('error', (err) => console.error('Connection error:', err));

  const channel = await connection.createChannel({
    json: true,
    setup: async (channel) => {
      // removed assert exchanges as i have declared and binded them in th producer no need to do here again
      await channel.assertQueue('notifications_queue');
      console.log(`Waiting for messages in notifications queue...`);
    },
  });

  return channel;
}
