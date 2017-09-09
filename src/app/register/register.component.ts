import {
  Component,
  OnInit,
} from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from './../validation.service';
import { PasswordValidation } from './password-validation';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService, AuthenticationService } from '../services/index';

@Component({
  selector: 'register',
  styleUrls: [ './register.component.css' ],
  templateUrl: './register.component.html' 
})
export class RegisterComponent {

public registerForm : any; 
public passwordMatch : string = "";
public  returnUrl: string;
public  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService    
    ) {
      
    this.registerForm = this.formBuilder.group({
      'emailAddress': ['', [Validators.required, ValidationService.emailValidator]],
      'password': ['', [Validators.required, ValidationService.passwordValidator]],
      'confirmPassword': ['', Validators.required ],
      'fullName': ['', Validators.required],
      'address': ['', Validators.required],
      'city': ['', Validators.required],
      'country': ['', Validators.required],
      'tnc': ['', Validators.required],
      
    }, {
      validator: PasswordValidation.MatchPassword  
    });

  }
  
    ngOnInit() {
        // clear login
        this.authenticationService.logout();
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/login';
    }  

  registerAction() {

    if (this.registerForm.dirty && this.registerForm.valid) {
  

       this.loading = true;
       this.alertService.success("Registering user..");
       this.authenticationService.register(
         this.registerForm.value.emailAddress, 
         this.registerForm.value.password,
         this.registerForm.value.fullName,
         this.registerForm.value.address,
         this.registerForm.value.city,
         this.registerForm.value.country,
         )
            .subscribe(
                data => {

                    if(data.success == false) {
                     this.alertService.error(data.message);
                     this.loading = false;
                    } else { 
                     this.alertService.success(data.message);
                     setTimeout(() =>  this.router.navigate([this.returnUrl]) , 500);  
                    } 

                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });

    }

  }

}
