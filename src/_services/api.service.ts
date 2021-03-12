import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../environments/environment';
import {Observable} from 'rxjs';
import {Conversation} from '../_types/Conversation';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient
  ) {
  }

  /**
   * Conversation Methods
   */
  getAllConversations(): Observable<any> {
    return this.http.get(environment.apiUrl + '/conversations');
  }

  getConversation(conversationId: number): Observable<any> {
    return this.http.get(environment.apiUrl + '/conversations/' + conversationId.toString(10));
  }

  // trailing slash is necessary for Django to handle POST requests properly with APPEND_SLASH = True
  createConversation(title: string): Observable<any> {
    const body = {
      title,
      start_date: new Date().toISOString().split('T')[0] // proper date format for the API
    };
    return this.http.post(environment.apiUrl + '/conversations/', body);
  }

  getConversationsByText(title: string): Observable<any> {
    const params: HttpParams = new HttpParams({fromObject: {title}});
    return this.http.get(environment.apiUrl + '/conversations/', {params});
  }

  /**
   * Message Methods
   */

  getMessages(conversationId: number): Observable<any> {
    const params: HttpParams = new HttpParams({
      fromObject:
        {
          cid: conversationId.toString(10)
        }
    });
    return this.http.get(environment.apiUrl + '/messages', {params});
  }

  createMessage(text: string, conversationId: number): Observable<any> {
    const body = {
      text,
      conversation: conversationId.toString(10),
      datetime_sent: new Date().toISOString().split('.')[0]
    };
    return this.http.post(environment.apiUrl + '/messages/', body);
  }

  getMessagesByText(text: string, conversationId: number): Observable<any> {
    const params: HttpParams = new HttpParams({fromObject: {text, cid: conversationId.toString(10)}});
    return this.http.get(environment.apiUrl + '/messages/', {params});
  }

  /**
   * Thought Methods
   */
  getThoughts(messageId: number): Observable<any> {
    const params: HttpParams = new HttpParams({
      fromObject:
        {
          mid: messageId.toString(10)
        }
    });
    return this.http.get(environment.apiUrl + '/thoughts', {params});
  }

  createThought(text: string, messageId: number): Observable<any> {
    const body = {
      message: messageId.toString(10),
      text,
      datetime_sent: new Date().toISOString().split('.')[0]
    };
    return this.http.post(environment.apiUrl + '/thoughts/', body);
  }
}
