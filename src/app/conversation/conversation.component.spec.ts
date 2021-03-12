import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {ConversationComponent} from './conversation.component';
import {HttpClientModule} from '@angular/common/http';
import {RouterTestingModule} from '@angular/router/testing';
import {Conversation} from '../../_types/Conversation';
import {Message} from '../../_types/Message';
import {Thought} from '../../_types/Thought';
import Spy = jasmine.Spy;
import {Observable, of} from 'rxjs';
import {ApiService} from '../../_services/api.service';
import {ActivatedRoute} from '@angular/router';

describe('ConversationComponent', () => {
  let component: ConversationComponent;
  let fixture: ComponentFixture<ConversationComponent>;

  // the JSON responses do not conform to the interface
  let conversationResponse: object;
  let messagesResponse: any[];
  let thoughtsResponse: any[];
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
  let getConversationSpy: Spy;
  let getMessagesSpy: Spy;
  let getThoughtsSpy: Spy;
  let createMessageSpy: Spy;
  let createThoughtSpy: Spy;
  let getMessagesByTextSpy: Spy;
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
    messagesResponse = [messageResponse, messageResponse, messageResponse];
    thoughtsResponse = [thoughtResponse, thoughtResponse, thoughtResponse];

    // set up API service mock
    const mockApi = jasmine.createSpyObj('ApiService', [
      'getConversation', 'getMessages', 'getThoughts', 'createMessage', 'getMessagesByText', 'createThought'
    ]);
    getConversationSpy = mockApi.getConversation.withArgs(1).and.returnValue(of(conversationResponse));
    getMessagesSpy = mockApi.getMessages.withArgs(1).and.returnValue(of(messagesResponse));
    getThoughtsSpy = mockApi.getThoughts.withArgs(1).and.returnValue(of(thoughtsResponse));
    createMessageSpy = mockApi.createMessage.withArgs('This is a message.', 1).and.returnValue(of(messageResponse));
    createThoughtSpy = mockApi.createThought.withArgs('This is a thought.', 1).and.returnValue(of(thoughtResponse));
    getMessagesByTextSpy = mockApi.getMessagesByText.withArgs('Ave').and.returnValue(of(messagesResponse));

    // configure TestBed
    await TestBed.configureTestingModule({
      declarations: [ConversationComponent],
      imports: [HttpClientModule, RouterTestingModule],
      providers: [HttpClientModule, RouterTestingModule,
        {provide: ApiService, useValue: mockApi},
        {provide: ActivatedRoute, useValue: {snapshot: {paramMap: {get: () => conversation.id}}}}
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should fetch messages and conversation on init', fakeAsync(() => {
    expect(component).toBeTruthy();
    fixture.detectChanges();
    tick();
    expect(component.conversation).toEqual(conversation);
    expect(component.messages).toEqual([message, message, message]);
  }));

  it('refreshConversation() should fetch conversation messages', fakeAsync(() => {
    component.messages = [];
    component.refreshConversation();
    fixture.detectChanges();
    tick();
    expect(component.conversation).toEqual(conversation);
    expect(component.messages).toEqual([message, message, message]);
  }));

  it('createMessage() should refresh messages list', fakeAsync(() => {
    component.newMessage = message.text;
    component.messages = [];
    component.createMessage();
    fixture.detectChanges();
    tick();
    expect(component.messages).toEqual([message, message, message]);
  }));

  it('createThought() should refresh thoughts list', fakeAsync(() => {
    component.selectedMessage = message;
    component.createThought('This is a thought.');
    fixture.detectChanges();
    tick();
    expect(component.messages).toEqual([message, message, message]);
    expect(component.thoughts).toEqual([thought, thought, thought]);
  }));

  it('createThought() should abort early if selectedMessage is null', fakeAsync(() => {
    component.selectedMessage = null;
    component.createThought('This is a thought.');
    fixture.detectChanges();
    tick();
    expect(createMessageSpy.calls.any()).toBeFalse();
  }));

  it('toggleSelected() should toggle from message to null', fakeAsync(() => {
    expect(component.selectedMessage).toBeNull();
    component.toggleSelected(message);
    fixture.detectChanges();
    tick();
    expect(component.selectedMessage).toEqual(message);
    component.toggleSelected(message);
    fixture.detectChanges();
    tick();
    expect(component.selectedMessage).toBeNull();
  }));
});
