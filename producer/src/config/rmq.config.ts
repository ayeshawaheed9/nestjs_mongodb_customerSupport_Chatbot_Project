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
      const fanoutExchange = 'fanout_exchange';
      const topicExchange = 'topic_exchange';

      await channel.assertExchange(fanoutExchange, 'fanout');
      await channel.assertExchange(topicExchange, 'topic');

      const queues = [
        { name: 'orders_queue', routingKey: 'orders.*' },
        { name: 'billing_queue', routingKey: 'billing.*' },
        { name: 'notifications_queue', routingKey: 'notifications.*' },
      ];

      for (const { name, routingKey } of queues) {
        await channel.assertQueue(name);
        await channel.bindQueue(name, fanoutExchange, '');
        await channel.bindQueue(name, topicExchange, routingKey);
      }
      console.log('Fanout exchange, topic exchange, and queues configured');
      await channel.assertExchange('dlx_exchange', 'direct', { durable: true });
      await channel.assertQueue('failed_queue', { durable: true });
      await channel.bindQueue(
        'failed_queue',
        'dlx_exchange',
        'failed_routing_key',
      );
      console.log('dlx exchange and queue initiliazed');
    },
  });

  return channel;
}
