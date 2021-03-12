import {Component, OnInit} from '@angular/core';
import {Conversation} from '../../_types/Conversation';
import {ApiService} from '../../_services/api.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  conversations: Conversation[] = [];

  // TODO actually handle the error
  private handleError(err: Error): Error {
    console.error(err);
    return err;
  }

  ngOnInit(): void {
    this.fetchConversations();
  }

  fetchConversations(): void {
    this.api.getAllConversations().subscribe(
      next => {
        this.conversations = next?.map((val: any) => {
          return {
            id: val.id,
            title: val.title,
            startDate: val.start_date
          };
        });
      },
      err => this.handleError(err)
    );
  }

  createConversation(value: string): void {
    this.api.createConversation(value).subscribe(
      next => {
        console.log(next);
        if (next.id) {
          this.navigateToConversation(next.id);
        }
      },
      err => this.handleError(err)
    );
  }

  navigateToConversation(cId: number): void {
    console.log(`conversations/${cId}`);
    this.router.navigateByUrl(`conversation/${cId}`).catch(
      err => this.handleError(err)
    );
  }

  searchConversations(value: string): void {
    if (value.trim().length === 0) {
      return;
    }
    console.log(`searching for ${value} in conversations`);
    this.api.getConversationsByText(value).subscribe(
      next => {
        this.conversations = next?.map((val: any) => {
          return {
            id: val.id,
            title: val.title,
            startDate: val.start_date
          };
        });
      },
      err => this.handleError(err)
    );
  }
}
