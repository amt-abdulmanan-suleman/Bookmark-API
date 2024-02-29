import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";

import * as argon from  'argon2'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService{
    constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService){}
    async login(dto: AuthDto){
        const {email, password} = dto;

        const user = await this.prisma.user.findFirst({
            where:{
                email
            }
        })

        if(!user) throw new NotFoundException("User not found")

        const isPasswordCorrect = await argon.verify(user.password,password);

        if(!isPasswordCorrect) throw new UnauthorizedException("Invalid Password");

        return this.signToken(user.id, user.email)
    }
    async signup(dto: AuthDto){
        const {firstName, lastName, password, email} = dto
        try {
            const hash = await argon.hash(password)

            const user = await this.prisma.user.create({
                data:{
                    firstName,
                    lastName,
                    password: hash,
                    email
                }
                
            })
            delete(user.password)
            const token = this.signToken(user.id, user.email)
            return {user,token}
        } catch (error) {
            if(error instanceof PrismaClientKnownRequestError){
                if(error.code == 'P2002'){
                    throw new ForbiddenException("Credentials taken")
                }
            }
            throw error;
        }
    }

    async signToken(userId: number, email: string): Promise<{}>{
        const payload = {
            userId, email
        }
        const secret = this.config.get("JWT_SECRET")

        const token = await this.jwt.signAsync(payload, {expiresIn: '15m', secret: secret})

        return token
    }
}