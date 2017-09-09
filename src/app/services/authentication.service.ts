import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

@Injectable()
export class AuthenticationService {

 

    constructor(private http: Http) { }


    isLoggedIn(){
      if(localStorage.getItem('currentUser')) {
        return true;
      } else { 
        return false;
      }
    }

    login(username: string, password: string) {

    let headers = new Headers({ 'Content-Type': 'application/json' });
    var requestData = JSON.stringify({ username: username, password: password });


        return this.http.post('http://localhost/reddit/api/index.php/Api/login/',requestData, headers )
            .map((response: Response) => {

                console.log(response);

                // login successful if there's a jwt token in the response
                let user = response.json();
                 
                if (user && user.success == true) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user.data));
                    return user; 

                }  else { 
                   return user;
                }
                 
            });
    }

    logout() {
              // remove user from local storage to log user out
              localStorage.removeItem('currentUser');         
    }

    register(username: string, password: string, fullName : string, address : string ,city : string, country : string) {

    let headers = new Headers({ 'Content-Type': 'application/json' });
    var requestData = JSON.stringify({ 
                           username: username, 
                           password: password,
                           fullName: fullName,
                           address: address,
                           city : city, 
                           country : country
                       });

        return this.http.post('http://localhost/reddit/api/index.php/Api/register/',requestData, headers )
            .map((response: Response) => {

                console.log(response);

                // login successful if there's a jwt token in the response
                let res = response.json();
                if (res && res.success == true) {
                    return res; 
                }  else { 
                   return res;
                }
                 
            });
    }





}