import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { User } from '../models/index';

@Injectable()
export class RedditService {

	public apiUrl : string = "http://localhost/reddit/api/index.php/Api/"
    
    constructor(private http: Http) { }

    getPosts(category,start,end,searchQuery) {

    let headers = new Headers({ 'Content-Type': 'application/json' });
 
    //Requesting to the .json as per requirements and use seo/bot firendly uri  
    return this.http.get( this.apiUrl + 'getposts.json?category=' + category + "&start=" + start + "&end=" + end + "&search=" + searchQuery)
        .map((response: Response) => {

            let res = response.json();
            console.log(res);
            return res; 

        });
    

 

    }


}