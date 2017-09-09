import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { User } from '../models/index';

@Injectable()
export class UserService {
    constructor(private http: Http) { }

    getAll() {
        return this.http.get('/api/users', this.jwt()).map((response: Response) => response.json());
    }

    getById(id: number) {
        return this.http.get('/api/users/' + id, this.jwt()).map((response: Response) => response.json());
    }

    create(user: User) {
        return this.http.post('/api/users', user, this.jwt()).map((response: Response) => response.json());
    }

    update(user: User) {
        return this.http.put('/api/users/' + user.id, user, this.jwt()).map((response: Response) => response.json());
    }

    delete(id: number) {
        return this.http.delete('/api/users/' + id, this.jwt()).map((response: Response) => response.json());
    }

    // private helper methods

    private jwt() {
        // create authorization header with jwt token
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
            let headers = new Headers({ 'Authorization': 'Bearer ' + currentUser.token });
            return new RequestOptions({ headers: headers });
        }
    }

    submitPost(postData,token) {

    let headers = new Headers({ 'Content-Type': 'application/json' });
    var requestData = JSON.stringify({ postData : postData , token : token });


        return this.http.post('http://localhost/reddit/api/index.php/Api/createpost/',requestData, headers )
            .map((response: Response) => {

                let res = response.json();
                return res; 

            });
    }

    votePost(postId,action,token) {

    let headers = new Headers({ 'Content-Type': 'application/json' });
    var requestData = JSON.stringify({ id : postId, action : action , token : token });

        return this.http.post('http://localhost/reddit/api/index.php/Api/vote/',requestData, headers )
            .map((response: Response) => {

                let res = response.json();
                return res; 

            });
    }

}