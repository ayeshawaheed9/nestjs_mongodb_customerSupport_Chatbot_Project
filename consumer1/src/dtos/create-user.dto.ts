import { IsOptional, IsString } from "class-validator"
export class createUserDto{
    @IsString()
    userName: string;
    password: string;
    phoneNumber:number;

    @IsOptional()
    email?:string;


}