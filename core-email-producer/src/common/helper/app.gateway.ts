import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { IDecryptWrapper } from 'src/interface/base.response.interface';
import { CacheUserService } from 'src/common/cache/cache-user.service';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from '../../modules/auth/auth.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(
        private authService: AuthService,
        @Inject(CacheUserService) private readonly userCacheService: CacheUserService,
    ) { }

    @WebSocketServer() server: Server;
    private clients: Map<string, Socket> = new Map();


    async handleConnection(client: Socket, ...args: any[]) {
        try {
            const token: string = client?.handshake?.headers['authorization'];

            const decodeJWTToken: IDecryptWrapper = this.authService.decodeJWT(token) as IDecryptWrapper;

            console.log(`Client connected: ${client?.id}`);
            this.clients.set(client?.id, client);  // Store reference to the client
            this.userCacheService.handleWebSocketClientData(decodeJWTToken?.id, client?.id);

        } catch (error) {
            throw new InternalServerErrorException()
        }
    }

    async handleDisconnect(client: Socket) {
        try {
            console.log(`Client disconnected: ${client?.id}`);
            this.clients.delete(client?.id);  // Remove reference on disconnect
            this.userCacheService.handleWebSocketRemoveClientData(client?.id)
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }

    sendSynckAcknowledgementToAll(message: any) {
        try {
            this.server.emit('message', message);
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }

    sendSynckAcknowledgementToClient(clientId: string, message: any) {
        try {
            const client = this.clients.get(clientId);
            if (client) {
                client.emit('message', message);
            } else {
                console.log(`No client found with ID ${clientId}`);
            }
        } catch (error) {
            throw new InternalServerErrorException()
        }

    }
    sendSynckAcknowledgementToClientForMutateEmail(clientId: string, message: any) {
        try {
            const client = this.clients.get(clientId);
            if (client) {
                client.emit('mutateEmail', message);
            } else {
                console.log(`No client found with ID ${clientId}`);
            }
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }

    sendSynckAcknowledgementToAllForMutateEmail(message: any) {
        try {
            this.server.emit('mutateEmail', message);
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }

}
