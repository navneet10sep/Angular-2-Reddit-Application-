import {
  Component,
  OnInit,
} from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from './../validation.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, AuthenticationService } from '../services/index';

@Component({
  moduleId: module.id.toString(),	
  selector: 'login',
  styleUrls: [ './login.component.css' ],
  templateUrl: './login.component.html' 
})
export class LoginComponent implements OnInit  {
 
  public  loginForm: any;
  public  model: any = {};
  public  loading = false;
  public  returnUrl: string;
  public loginResult : any; 

  constructor(
  	    private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private alertService: AlertService
  	) {
      
    this.loginForm = this.formBuilder.group({
      'username': ['', [Validators.required, ValidationService.emailValidator]],
      'password': ['', Validators.required],
    });
 
  }

    ngOnInit() {
        // clear login
        this.authenticationService.logout();
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }
  

  loginAction() {

    if (this.loginForm.dirty && this.loginForm.valid) {
      
       this.loading = true;
       this.alertService.success("Authunticating...");
       this.authenticationService.login(this.loginForm.value.username, this.loginForm.value.password)
            .subscribe(
                data => {

                    if(data.success == false) {
                     this.alertService.error(data.message);
                     this.loading = false;
                    } else { 
                      
                     this.alertService.success(data.message);
                     this.router.navigate([this.returnUrl]);  
                     setTimeout(() =>  this.router.navigate([this.returnUrl]) , 100);  
                    } 

                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
 
    }
  }

}
