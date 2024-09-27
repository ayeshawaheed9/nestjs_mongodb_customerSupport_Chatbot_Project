import { Body, Logger } from '@nestjs/common';
import { MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class ordersGateway implements OnGatewayInit {
    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger('ordersGateway')

    afterInit(server : Server) {
        this.logger.log("websocket initialized")
    }

    @SubscribeMessage('newMessage')
    onNewMessage(@MessageBody() data:any) {
        this.logger.log("newEvent")
        this.server.emit('onMessage' ,{
            msg: 'New Message',
            content: data
        })
        console.log(data);
    }
}