import { WebSocketGateway, WebSocketServer, OnGatewayInit, SubscribeMessage, MessageBody} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { HuggingFaceService } from 'src/hugging_face/hf.service';
@WebSocketGateway(8000)
export class HuggingFaceGateway implements OnGatewayInit {
    constructor(private readonly huggingFaceService: HuggingFaceService){
    }
    @WebSocketServer()
    server: Server;
    private logger: Logger = new Logger('HuggingFaceConsumerGateway');

    afterInit(server: Server) {
        this.logger.log("Consumer WebSocket initialized");
    }

    @SubscribeMessage('newHuggingFaceEvent')
    async handleMessage(client: any, payload: { userId: string, question: string }): Promise<void> {
        const { userId, question } = payload;
        const answer = await this.huggingFaceService.getSentimentalIntentContextualAnswer(question, userId);
        client.emit('messageResponse', answer); // Send response back to the client
    }
}
