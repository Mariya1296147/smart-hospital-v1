import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AdminRegisterRequest, UserDTO } from '../../models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly resource = 'users';
  
  constructor(private readonly api: ApiService) {}

  getUsers(): Observable<UserDTO[]> { 
    return this.api.getAll<UserDTO>(this.resource); }

  getUserByUsername(username: string): Observable<UserDTO> {
    return this.api.getById<UserDTO>(this.resource, username);
  }
  createUser(user: AdminRegisterRequest): Observable<string> {
    return this.api.createText(this.resource, user);
  }
  updateUser(username: string, user: Partial<UserDTO>): Observable<UserDTO> {
    return this.api.update<UserDTO>(this.resource, username, user);
  }
  deleteUser(username: string): Observable<void> {
    return this.api.remove(this.resource, username);
  }
}
