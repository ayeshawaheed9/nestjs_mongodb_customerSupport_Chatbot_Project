import amqp from "amqp-connection-manager";
export async function createRmqConnection(){
const connection = await amqp.connect(['amqp://localhost:5672']);
if (connection){
    console.log('yes');
}
console.log(connection);
connection.on('connect', () => {
  console.log('Successfully connected to RabbitMQ(from file rmq config)');
});
connection.on('error', (err) => {
    console.error('Connection error:', err);
});
connection.on('disconnect', (params) => {
  console.error('Disconnected from RabbitMQ:', params.err.message);
});
  
  const channel = await connection.createChannel();

  //dead letter exchange and qeuee 
  const dlxExchange = 'dlx_exchange';
  const dlxQueue = 'dlx_queue';

  await channel.assertExchange(dlxExchange, 'direct', { durable: true });
  await channel.assertQueue(dlxQueue, { durable: true });
  await channel.bindQueue(dlxQueue, dlxExchange, 'dead_letter');
  //direct exchange main queue

  const exchange = 'direct_exchange';
  const exchangeType ='direct'; 
  const queue= 'orders_queue';
  const routingKey = 'order_placed';
  
  await channel.assertExchange(exchange, exchangeType, { durable: true });
  await channel.assertQueue(queue, { durable: true, arguments: {
    'x-message-ttl': 60000,
    'x-dead-letter-exchange': dlxExchange,  // Configure Dead Letter Exchange
    'x-dead-letter-routing-key': 'dead_letter'  // Routing key for DLX
} });
  await channel.bindQueue(queue, exchange, routingKey);



  return channel;
}