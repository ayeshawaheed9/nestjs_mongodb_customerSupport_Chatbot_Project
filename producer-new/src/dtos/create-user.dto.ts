import { IsOptional, IsString } from "class-validator"
export class createUserDto{
    @IsString()
    userName: string;

    phoneNumber:number;
    
    @IsOptional()
    email?:string;


}