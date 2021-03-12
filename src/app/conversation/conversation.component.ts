import {Component, OnInit} from '@angular/core';
import {Conversation} from '../../_types/Conversation';
import {Message} from '../../_types/Message';
import {ApiService} from '../../_services/api.service';
import {ActivatedRoute} from '@angular/router';
import {Thought} from '../../_types/Thought';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css']
})
export class ConversationComponent implements OnInit {
  conversation: Conversation = {title: '', id: 0, startDate: ''};
  messages: Message[] = [];
  newMessage = '';
  selectedMessage: Message | null;
  thoughts: Thought[] = [];

  constructor(
    private api: ApiService,
    private route: ActivatedRoute
  ) {
    this.selectedMessage = null;
  }

  // TODO actually handle the error
  private handleError(err: Error): Error {
    console.error(err);
    return err;
  }

  ngOnInit(): void {
    const cId: number = Number.parseInt(this.route.snapshot.paramMap.get('cid') || '0', 10);
    this.getConversation(cId);
    this.getMessages(cId);
  }

  private getConversation(cId: number): void {
    this.api.getConversation(cId).subscribe(
      next => {
        this.conversation = {
          title: next.title,
          startDate: next.start_date,
          id: next.id
        };
      },
      err => this.handleError(err)
    );
  }

  private getMessages(cId: number): void {
    this.selectedMessage = null;
    this.thoughts = [];
    this.api.getMessages(cId).subscribe(
      next => {
        if (!next.length || next.length < 1) {
          return;
        }
        this.messages = next.map((val: any) => {
          return {
            conversation: this.conversation.id,
            id: val.id,
            text: val.text,
            datetimeSent: val.datetime_sent,
          };
        });
      }
    );
  }

  createMessage(): void {
    this.api.createMessage(this.newMessage, this.conversation.id).subscribe(
      next => {
        console.log(next);
        this.getMessages(this.conversation.id); // refresh the view
      },
      err => this.handleError(err)
    );
    this.newMessage = '';
  }

  toggleSelected(message: Message): void {
    if (this.selectedMessage === message) {
      this.selectedMessage = null;
    } else {
      this.selectedMessage = message;
      this.getMessageThoughts(message.id);
    }
  }

  private getMessageThoughts(id: number): void {
    this.thoughts = [];
    this.api.getThoughts(id).subscribe(
      next => {
        if (next) {
          this.thoughts = next.map((val: any) => {
            return {
              id: val.id,
              text: val.text,
              datetimeSent: val.datetime_sent,
              message: val.message
            };
          });
        }
      }
    );
  }

  createThought(text: string): void {
    if (!this.selectedMessage) {
      console.warn('thought submitted without selected message');
    }
    const mid = this.selectedMessage?.id;
    if (!mid) {
      return;
    }
    this.api.createThought(text, mid).subscribe(
      next => {
        console.log(next);
        this.getMessageThoughts(mid);
      },
      err => this.handleError(err)
    );
  }

  searchMessages(value: string): void {
    console.log(`searching for ${value} in messages`);
    this.api.getMessagesByText(value, this.conversation.id).subscribe(
      next => {
        this.messages = next?.map((val: any) => {
          return {
            id: val.id,
            text: val.text,
            datetimeSent: val.datetime_sent
          };
        });
      },
      err => this.handleError(err)
    );
    this.selectedMessage = null;
    this.thoughts = [];
  }

  refreshConversation(): void {
    this.getMessages(this.conversation.id);
  }
}
