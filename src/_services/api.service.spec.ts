import {inject, TestBed} from '@angular/core/testing';

import {ApiService} from './api.service';
import {Conversation} from '../_types/Conversation';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {environment} from '../environments/environment';
import {Message} from '../_types/Message';
import {Thought} from '../_types/Thought';

describe('ApiService', () => {
  let httpTestingController: HttpTestingController;
  const baseUrl = environment.apiUrl;

  // subject
  let apiService: ApiService;

  // mock data
  let dummyConversationResponse: object;
  let dummyMessageResponse: object;
  let dummyThoughtResponse: object;
  let conversation: Conversation;
  let message: Message;
  let thought: Thought;

  /**
   * Setup
   */

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    // controller used to inspect and mock requests/responses
    httpTestingController = TestBed.get(HttpTestingController);
    conversation = {
      id: 1,
      startDate: new Date().toISOString().split('T')[0],
      title: 'Ave mundus!'
    };
    message = {
      id: 1,
      conversation: 1,
      datetimeSent: new Date().toISOString().split('.')[0],
      text: 'This is a message.'
    };
    thought = {
      id: 1,
      message: 1,
      datetimeSent: new Date().toISOString().split('.')[0],
      text: 'This is a thought.'
    };

    dummyConversationResponse = {
      id: conversation.id,
      start_date: conversation.startDate,
      title: conversation.title
    };
    dummyMessageResponse = {
      id: message.id,
      message: message.conversation,
      datetime_sent: message.datetimeSent,
      text: message.text
    };
    dummyThoughtResponse = {
      id: thought.id,
      message: thought.message,
      start_date: thought.datetimeSent,
      text: thought.text
    };
  });

  beforeEach(inject(
    [ApiService],
    (service: ApiService) => {
      apiService = service; // inject a fixture before each test
    }
  ));

  /**
   * Tests below
   */

  it('getAllConversations() should return all conversations', () => {
    let result: Conversation[];
    apiService.getAllConversations().subscribe(res => {
      result = res.results;
    });
    const req = httpTestingController.expectOne({
      method: 'GET',
      url: baseUrl + '/conversations'
    });

    // flush with expected results
    req.flush({results: [conversation]});

    // @ts-ignore : the result will be assigned by req.flush
    expect(result[0]).toEqual(conversation);
  });

  it('getConversation() should return a Conversation', () => {
    let result: Conversation;
    const expected: Conversation = {
      id: 1,
      title: 'Hello World!',
      startDate: '2021-03-21'
    };
    const cid = 1;
    apiService.getConversation(cid).subscribe(n => {
      result = {
        id: n.id,
        title: n.title,
        startDate: n.start_date
      };
    });

    const req = httpTestingController.expectOne(baseUrl + '/conversations/' + cid.toString());
    req.flush({
      id: cid,
      title: 'Hello World!',
      start_date: '2021-03-21'
    });

    // @ts-ignore
    expect(result).toEqual(expected);
  });

  it('getConversation() should return error when conversationId is a float', () => {
    let error: string;
    const badCid = 5.9;
    apiService.getConversation(badCid).subscribe(null, e => {
      error = e;
    });

    const req = httpTestingController.expectOne(baseUrl + '/conversations/' + badCid.toString());
    req.flush('Something went wrong', {
      status: 400,
      statusText: 'Bad Request'
    });

    // @ts-ignore
    expect(error.status).toBe(400);
  });

  it('createConversation() should set the correct properties on request body', () => {
    apiService.createConversation(conversation.title).subscribe(); // discard response
    const expectedDate = conversation.startDate; // Django DateField format
    const expectedBody = {
      start_date: expectedDate,
      title: conversation.title
    };
    const req = httpTestingController.expectOne({method: 'POST', url: baseUrl + '/conversations/'});
    expect(req.request.body).toEqual(expectedBody);
  });

  it('createConversation() should echo successfully posted conversation', () => {
    const expectedResult: Conversation = {
      id: conversation.id,
      startDate: conversation.startDate,
      title: conversation.title
    };
    const expectedResponseBody = {
      id: conversation.id,
      start_date: conversation.startDate,
      title: conversation.title
    };
    let result: Conversation;
    apiService.createConversation(conversation.title).subscribe(res => {
      result = {
        startDate: res.start_date,
        id: res.id,
        title: res.title
      };
    });

    const req = httpTestingController.expectOne({method: 'POST', url: baseUrl + '/conversations/'});
    req.flush(expectedResponseBody);

    // @ts-ignore
    expect(result).toEqual(expectedResult);
  });

  it('getConversationsByText() should return an array of conversation info', () => {
    const searchText = 'Hel';
    let result: Conversation[];
    const expectedResponse = [dummyConversationResponse, dummyConversationResponse, dummyConversationResponse];

    apiService.getConversationsByText(searchText).subscribe(res => {
      result = res;
    });

    const req = httpTestingController.expectOne(baseUrl + '/conversations/?title=' + searchText);
    req.flush(expectedResponse); // return an array

    // @ts-ignore
    expect(result).toEqual(expectedResponse);
  });

  it('getMessages() should return all messages', () => {
    let result: Message[];
    apiService.getMessages(conversation.id).subscribe(res => {
      result = res.results;
    });
    const req = httpTestingController.expectOne({
      method: 'GET', url: baseUrl + '/messages?cid=' + message.conversation.toString(10)
    });

    // flush with expected results
    req.flush({results: [message]});

    // @ts-ignore : the result will be assigned by req.flush
    expect(result[0]).toEqual(message);
  });

  it('createMessage() should set the correct properties on request body', () => {
    apiService.createMessage(message.text, message.conversation).subscribe(); // discard response
    const expectedBody = {
      datetime_sent: message.datetimeSent,
      text: message.text,
      conversation: message.conversation.toString(10)
    };
    const req = httpTestingController.expectOne({method: 'POST', url: baseUrl + '/messages/'});
    expect(req.request.body).toEqual(expectedBody);
  });

  it('getMessagesByText() should return an array of message info', () => {
    const searchText = 'is';
    let result: Message[];
    const expectedResponse = [dummyMessageResponse, dummyMessageResponse, dummyMessageResponse];

    apiService.getMessagesByText(searchText, message.conversation).subscribe(res => {
      result = res;
    });

    const req = httpTestingController.expectOne(baseUrl + `/messages/?text=${searchText}&cid=${message.conversation}`);
    req.flush(expectedResponse); // return an array

    // @ts-ignore
    expect(result).toEqual(expectedResponse);
  });


  it('getThoughts() should return all thoughts for a given message', () => {
    let result: Thought[];
    apiService.getThoughts(message.id).subscribe(res => {
      result = res.results;
    });
    const req = httpTestingController.expectOne({
      method: 'GET', url: baseUrl + '/thoughts?mid=' + message.id.toString(10)
    });

    // flush with expected results
    req.flush({results: [thought]});

    // @ts-ignore : the result will be assigned by req.flush
    expect(result[0]).toEqual(thought);
  });

  it('createThought() should set the correct properties on request body', () => {
    apiService.createThought(thought.text, message.id).subscribe(); // discard response
    const expectedBody = {
      datetime_sent: thought.datetimeSent,
      text: thought.text,
      message: message.id.toString(10)
    };
    const req = httpTestingController.expectOne({method: 'POST', url: baseUrl + '/thoughts/'});
    expect(req.request.body).toEqual(expectedBody);
  });
});
