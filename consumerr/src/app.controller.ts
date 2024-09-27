import { Controller } from "@nestjs/common";
import { AppService } from './app.service';
import { Ctx, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";

@Controller()
export class AppController{
    constructor(private readonly appService: AppService)
    {}

    @MessagePattern()
    async acceptOrder(@Payload() order : any, @Ctx() context: RmqContext){
        const channel = context.getChannelRef(); 
        const originalMessage = context.getMessage(); // Get the original RabbitMQ message
        channel.nack(originalMessage, false, false)
        console.log('Order Recieved: ', order);

    }


    // @MessagePattern('dead_letter')
    // async acceptOrder(@Payload() order : any, @Ctx() context: RmqContext){
    //     const channel = context.getChannelRef(); 
    //     const originalMessage = context.getMessage(); // Get the original RabbitMQ message
    //     console.log('Order Recieved by dlq: ', order);

    // }
}