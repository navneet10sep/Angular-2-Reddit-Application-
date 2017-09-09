import {
  Component,
  ngOnInit,
  ViewChild,
  ElementRef,
  Inject,
  ViewContainerRef, 
  ReflectiveInjector, 
  ComponentFactoryResolver, 
  ComponentRef,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  Input
} from '@angular/core';

import { AppState } from '../app.service';
import { Title } from './title';
import { XLargeDirective } from './x-large';
import { User } from '../models/index';
import { Router, ActivatedRoute } from '@angular/router';
import { RedditService, UserService ,AlertService, AuthenticationService } from '../services/index';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { NewpostComponent } from './newpost';
import { page } from './page';
import { postview } from './postview';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay'

interface IServerResponse {
    sucess: boolean;
    data: any;
    rows: number;
}

@Component({

  selector: 'home',  
  styleUrls: [ './home.component.css' ],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class HomeComponent implements ngOnInit {
 
  public localState = { value: '' };
  public  currentUser: User;
  public users: User[] = [];
  public postsStorage : any[] = [];
   
    //Pagination vars
    @Input('data') meals: string[] = [];
    asyncMeals: Observable<string[]>;
    p: number = 1;
    total: number;
    loading: boolean;
    category : string = "hot"; //default: hot


    @ViewChild('modal') pl: ModalComponent;
    @ViewChild('postview') _postview: postview;
    @ViewChild("searchQuery") searchQuery: ElementRef; 
    @ViewChild("newpostContainer") newpostContainer: ElementRef; 
    @ViewChild("postsContainer") postsContainer: ElementRef; 
    @ViewChild("postViewContainer") postViewContainer: ElementRef; 
    @ViewChild(NewpostComponent)
    private _newpost: NewpostComponent;
    @ViewChild("postViewRef", {read: ViewContainerRef}) postViewRef: ViewContainerRef;

  constructor(
    public appState: AppState,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private redditService: RedditService,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {
   this.currentUser = JSON.parse(localStorage.getItem('currentUser'));  
  }

  ngOnInit() { 

   //Get All the posts from the reddit 
   this.getPage(1);

  }

  renderPosts(posts){

    console.log("show posts");
    
    //Clear all previously loaded posts
    this.clearPosts();

     for(var i = 0 ; i < posts.data.length; i++ ) {

        var post = posts.data[i];
   
      const factory = this.componentFactoryResolver.resolveComponentFactory(page);
      const postRef = this.postViewRef.createComponent(factory);
      postRef.instance.postId = post.id;
      postRef.instance.postTitle = post.title;
      postRef.instance.postDate = post.postDate;
      postRef.instance.postDesc = post.desc;
      postRef.instance.postLink = post.link;
      postRef.instance.postType = post.type;
      postRef.instance.userName = post.userName;
      postRef.instance.userCity = post.userCity;
      postRef.instance.userCountry = post.userCountry;
      postRef.instance.voteUps = post.voteUps;
      postRef.instance.voteDowns = post.voteDowns;

      //Add View Post Event 
      postRef.instance.renderPostView.subscribe( renderData => this.viewPost(renderData) );

      postRef.changeDetectorRef.detectChanges();

      //Save Post Reference 
      this.postsStorage.push(postRef);
      
     }

  }

  loadPosts(category: string) {
     
    this.category = category;
    this.newpostContainer.nativeElement.style.display = "none";
    this.postViewContainer.nativeElement.style.display = "none";
    this.postsContainer.nativeElement.style.display = "block";
    this.getPage(1);

  }

  getPage(page: number){

        this.loading = true;
        this.asyncMeals = this.serverCall(this.meals, page)
            .do(res => {
                this.total = res.rows;
                this.p = page;
                this.loading = false;
            })
            .map(res => res.data);

   }

  serverCall(meals: any, page: number): Observable<IServerResponse> {
    const perPage = 10;
    const start = (page - 1) * perPage;
    const end = start + perPage;
  
    var totalRows = 0;
    var searchQuery = this.searchQuery.nativeElement.value;
    if(typeof searchQuery === "undefined") { searchQuery = ""; }

    this.redditService.getPosts(this.category,start,end,searchQuery).subscribe(
            data => {
                    
                this.renderPosts(data);
                totalRows = data.rows;
                this.asyncMeals = Observable
                                  .of({
                                      success : true,
                                      data: meals.slice(start, end),
                                      rows: data.rows
                                  }).do(res => {
                                      this.total = data.rows;
                                      this.p = page;
                                      this.loading = false;
                                  })
                                  .map(res => res.data);
             
            },
            error => {
                this.alertService.error(error);
              
            });

      return Observable
        .of({
            success  : true,
            data: meals.slice(start, end),
            total: totalRows
        }).delay(1000);
 
  }

 

  clearPosts() {
   
    //Patch on pageOrder where pageOrder < the one that is deleted 
    for(var i=0; i < this.postsStorage.length; i++ ) {
      this.postsStorage[i].destroy();
    }

  }

  public submitState(value: string) {
    console.log('submitState', value);
    this.appState.set('value', value);
    this.localState.value = '';
  }


  logout(){
    
    console.log("Log out");
    this.authenticationService.logout();
    this.currentUser = null;
    this.router.navigate(["./"]);

  }

  createNewPost(type: string){
  
  if(!this.currentUser) {
  this.pl.open();
  } else {
  this.newpostContainer.nativeElement.style.display = "block";
  this.postsContainer.nativeElement.style.display = "none";
  this.postViewContainer.nativeElement.style.display = "none";
  this._newpost.setType(type);
  }

  }

  viewPost(postData){

  this.newpostContainer.nativeElement.style.display = "none";
  this.postsContainer.nativeElement.style.display = "none";
  this.postViewContainer.nativeElement.style.display = "block";

 
    this._postview.postId = postData.postId;
    this._postview.postTitle = postData.postTitle;
    this._postview.postDate = postData.postDate;
    this._postview.postDesc = postData.postDesc;
    this._postview.postLink = postData.postLink;
    this._postview.postType = postData.postType;
    this._postview.userName = postData.userName;
    this._postview.userCity = postData.userCity;
    this._postview.userCountry = postData.userCountry;
    this._postview.voteUps = postData.voteUps;
    this._postview.voteDowns = postData.voteDowns;

 

  }

}
