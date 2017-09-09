import { 
Component,
Injectable, 
ngOnInit,
Input, 
ViewChild, 
ElementRef, 
Output, 
EventEmitter, 
ViewContainerRef 
} from '@angular/core';


import { User } from '../models/index';
import { Router, ActivatedRoute } from '@angular/router';
import { RedditService,  UserService ,AlertService, AuthenticationService } from '../../services/index';
import { Subject} from 'rxjs/Subject';
import {DomSanitizer} from '@angular/platform-browser'

@Component({

  selector: 'page',  
  styleUrls: [ './post.component.css' ],
  templateUrl: './post.component.html'
})


@Injectable()
export class page implements ngOnInit { 

  @Input() postId      : any;
  @Input() postTitle   : string;
  @Input() postDate    : string;
  @Input() postDesc    : string;
  @Input() postLink    : string;
  @Input() postType    : string;
  @Input() userName    : string;
  @Input() userCity    : string;
  @Input() userCountry : string;
  @Input() voteUps     : string;
  @Input() voteDowns   : string;

    @ViewChild("voteUps") _voteUps: ElementRef; 
    @ViewChild("voteDowns") _voteDowns: ElementRef; 
    renderPostView : Subject<boolean> = new Subject();

	constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private redditService: RedditService,
    private sanitizer:DomSanitizer
	){}

    ngOnInit(){

      this._voteUps.nativeElement.innerHTML = this.voteUps;
      this._voteDowns.nativeElement.innerHTML = this.voteDowns;

    }
 
  voteAction(action: string){

       this.alertService.success("Voting...");
       var user = JSON.parse(localStorage.getItem('currentUser')); 
       this.userService.votePost(this.postId,action,user.token)
            .subscribe(
                data => {

                    if(data.success == false) {
                     this.alertService.error(data.message);
                    } else { 

                     if(data.action == true){
                     
                     console.log("updating votes");
                     this._voteUps.nativeElement.innerHTML = this.voteUps = data.votesUps; 
                     this._voteDowns.nativeElement.innerHTML = this.voteUps = data.votesDowns; 
                     console.log("After Update");
                     console.log(this.voteUps);
                     console.log(this.voteDowns);

                        return true;
                     } else {
                       alert(data.message);
                     }

                    } 

                },
                error => {
                    this.alertService.error(error);
                });
  }

  viewPost(){

     this.renderPostView.next({
      postId : this.postId,
      postTitle : this.postTitle,
      postDate : this.postDate,
      postDesc : this.postDesc,
      postLink : this.postLink,
      postType : this.postType,
      userName : this.userName,
      userCity : this.userCity,
      userCountry : this.userCountry,
      voteUps : this.voteUps,
      voteDowns : this.voteDowns
     });

  }

sanitize(url:string){
    return this.sanitizer.bypassSecurityTrustUrl(url);
}

}