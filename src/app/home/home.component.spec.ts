import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {HomeComponent} from './home.component';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {of} from 'rxjs';
import {Conversation} from '../../_types/Conversation';
import Spy = jasmine.Spy;
import {ApiService} from '../../_services/api.service';
import {Message} from '../../_types/Message';
import {Thought} from '../../_types/Thought';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  // the JSON responses do not conform to the interface
  let conversationResponse: object;
  let conversationsResponse: any[];
  let messageResponse: object;
  let thoughtResponse: object;

  const conversation: Conversation = {
    id: 1,
    startDate: new Date().toISOString().split('T')[0],
    title: 'Ave mundus!'
  };
  const message: Message = {
    id: 1,
    conversation: 1,
    datetimeSent: new Date().toISOString().substring(0, 16),
    text: 'This is a message.'
  };
  const thought: Thought = {
    id: 1,
    message: 1,
    datetimeSent: new Date().toISOString().substring(0, 16),
    text: 'This is a thought.'
  };
  let apiSpy: Spy;


  beforeEach(async () => {
    conversationResponse = {
      id: 1,
      start_date: new Date().toISOString().split('T')[0],
      title: 'Ave mundus!'
    };
    messageResponse = {
      id: 1,
      conversation: 1,
      datetime_sent: new Date().toISOString().substring(0, 16),
      text: 'This is a message.'
    };
    thoughtResponse = {
      id: 1,
      message: 1,
      datetime_sent: new Date().toISOString().substring(0, 16),
      text: 'This is a thought.'
    };
    conversationsResponse = [conversationResponse, conversationResponse, conversationResponse];

    // set up API service mock
    const mockApi = jasmine.createSpyObj('ApiService', ['getAllConversations', 'getConversationsByText']);
    apiSpy = mockApi.getAllConversations.and.returnValue(of(conversationsResponse));
    apiSpy = mockApi.getConversationsByText.withArgs('Ave').and.returnValue(of(conversationsResponse));

    // configure TestBed
    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [HttpClientModule, RouterTestingModule],
      providers: [HttpClientModule, RouterTestingModule, {provide: ApiService, useValue: mockApi}]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('fetchConversations() should set conversations to an array', fakeAsync(() => {
    component.fetchConversations();
    fixture.detectChanges();
    tick();
    const expected = [conversation, conversation, conversation];
    expect(component.conversations).toEqual(expected);
  }));

  it('searchConversations() should set conversations to an array', fakeAsync(() => {
    component.searchConversations('Ave');
    fixture.detectChanges();
    tick();
    const expected = [conversation, conversation, conversation];
    expect(component.conversations).toEqual(expected);
  }));

  it('searchConversations() should not search for empty string', fakeAsync(() => {
    component.conversations = [conversation];

    component.searchConversations('');
    fixture.detectChanges();
    tick();

    expect(component.conversations).toEqual([conversation]);
  }));
});
