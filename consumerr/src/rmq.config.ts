import amqp from "amqp-connection-manager";
export async function createRmqConnection(){
const connection = await amqp.connect(['amqp://localhost:5672']);
if (connection){
    console.log('yes');
}
console.log(connection);
connection.on('connect', () => {
  console.log('Successfully connected to RabbitMQ');
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

  const exchange = 'direct_exchange';
  const exchangeType ='direct'; 
  const queue= 'orders_queue';
  const routingKey = 'order_placed';
  
  await channel.assertExchange(exchange, exchangeType, { durable: true });
  await channel.assertQueue(queue, { durable: true, arguments: {
    'x-message-ttl': 60000,
    'x-dead-letter-exchange': dlxExchange,  
    'x-dead-letter-routing-key': 'dead_letter'  

} });
  await channel.bindQueue(queue, exchange, routingKey);

  const exchange2 = 'order_status_exchange';
  const exchangeType2 ='direct'; 
  const queue2= 'orders_status_queue';
  const routingKey2 = 'order_status_updated';

  await channel.assertExchange(exchange2, exchangeType2, {durable: true});
  await channel.assertQueue(queue2, {durable: true})
  await channel.bindQueue(queue2, exchange2, routingKey2);

  return channel;
}