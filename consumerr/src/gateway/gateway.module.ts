import { Module } from "@nestjs/common";
import { ordersGateway } from "./ordersGateway";

@Module({})
export class GatewayModule{
providers: [ordersGateway]
}