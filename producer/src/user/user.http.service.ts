import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable, lastValueFrom } from 'rxjs';
import { createUserDto } from 'src/dtos/create-user.dto';
import { userloginDto } from 'src/dtos/user-login.dto';
import { Injectable } from '@nestjs/common';
@Injectable()
export class UserHttpService {
  private readonly consumerBaseUrl = 'http://localhost:9000/v1/users';
  constructor(private readonly httpService: HttpService) {}

  async createUser(user: createUserDto, role: string): Promise<AxiosResponse<any>> {
    const url = `${this.consumerBaseUrl}/create_user/${role}`;
    try {
      const response = await lastValueFrom(this.httpService.post(url, user));
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }
  async loginUser(loginCredentials: userloginDto, role: string, sessionId: string): Promise<AxiosResponse<any>> {
    const url = `${this.consumerBaseUrl}/login_user/${role}`;
    try {
      const response = await lastValueFrom(
        this.httpService.post(url, loginCredentials, {
          headers: { 'Session-Id': sessionId }, // Pass session ID if needed
        }),
      );
      return response.data;
    } catch (error) {
      console.error('Error logging in user:', error);
      throw new Error('Failed to login user');
    }
  }
  async logout(sessionId: string): Promise<AxiosResponse<any>> {
    const url = `${this.consumerBaseUrl}/logout`;
    try {
      const response = await lastValueFrom(
        this.httpService.post(url, {}, {
          headers: { 'Session-Id': sessionId },
        }),
      );
      return response.data;
    } catch (error) {
      console.error('Error logging out:', error);
      throw new Error('Failed to logout');
    }
  }
}
