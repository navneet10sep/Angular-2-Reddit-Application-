import {
  Component,
  OnInit,
  Injectable
} from '@angular/core';
 
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from './../../validation.service';
import { Router, CanActivate, ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService, AlertService, AuthenticationService } from '../../services/index';
import { Newpost } from './newpost.interface';
 
@Component({
  selector: 'newpost',
  styleUrls: [ './newpost.component.css' ],
  templateUrl: './newpost.component.html' 
})

@Injectable()
export class NewpostComponent implements CanActivate  {

  public  newpostForm: any;

  public POST_TYPE = {
    TEXT: 'text',
    LINK: 'link'
  };


  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,    
    private userService: UserService    
    ) {
      
  }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (localStorage.getItem('currentUser')) {

            return true;
        }
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
        return false;
    }

  ngOnInit() {

    this.newpostForm = this.formBuilder.group({
      title : ['', Validators.required ],
      postType :  this.initTypeFormGroup(),

    });

    this.subscribeTypeChanges();
    this.setType(this.POST_TYPE.TEXT);
  }


  initTypeFormGroup() {
    const group = this.formBuilder.group({
      type: [''],
      text: this.formBuilder.group(this.initTextModel()),
      link: this.formBuilder.group(this.initLinkModel())
    });

    return group;
  }

  initTextModel(): any {
    const model = {
      desc: ['',Validators.required],
    };
    return model;
  }

  initLinkModel(): any {
   
  	const validLinkRegex = `/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);`;

    //Regrex results for above created regrex 
    /*
	http://www.domain.subdomain.com // true 
	http://www.domain.123' // false 
	https://www.domain-withdash.com' // true 
	http://domain-withhashnowww-com.com' // true 
	http://domainnowww.com' //true 
	domainnohttpors.com //false
	http://www.domain.' //false
	http://www.doamin.c'//false
	http://www.doamininvalidportnumber:800000'//false
	www.domain.com ' //false
	http://domain' //false
	//subdomain.domain.net/js/app.js' //true
	*/


    const model = {
     // link: ['', [Validators.required, Validators.pattern(validLinkRegex)]],
      link: ['', Validators.required],
    };
    return model;
  }

  setType(type: string) {
    const ctrl = this.newpostForm.get('postType.type');
    ctrl.setValue(type);
  }

  subscribeTypeChanges() {
    // controls
    const textCtrl = this.newpostForm.get('postType.text') as FormGroup;
    const linkCtrl = this.newpostForm.get('postType.link') as FormGroup;

    // initialize value changes stream
    const changes$ = this.newpostForm.get('postType.type').valueChanges;

    // subscribe to the stream
    changes$.subscribe(postType => {

      if (postType === this.POST_TYPE.TEXT) {
        this.setTypeValidity(textCtrl, this.initTextModel());
        this.clearTypeValidity(linkCtrl);
      }

      if (postType === this.POST_TYPE.LINK) {
        this.setTypeValidity(linkCtrl, this.initLinkModel());
        this.clearTypeValidity(textCtrl);
      }

    });
  }

  private clearTypeValidity(control: FormGroup) {
    Object.keys(control.controls).forEach(key => {
      const ctrl = control.get(key);
      ctrl.clearValidators();
      ctrl.updateValueAndValidity();
    });
  }

  private setTypeValidity(control: FormGroup, model) {
    Object.keys(control.controls).forEach(key => {
      const ctrl = control.get(key);
      ctrl.setValidators(model[key][1]);
      ctrl.updateValueAndValidity();
    });
  }

  newpostAction() {

    if (this.newpostForm.dirty && this.newpostForm.valid) {
    }

  }

  save(model: Newpost, isValid: boolean) {
    
    console.log(model, isValid);

    if(isValid) {
      

       this.alertService.success("submitting...");
       var user = JSON.parse(localStorage.getItem('currentUser')); 
       this.userService.submitPost(model, user.token)
            .subscribe(
                data => {

                    if(data.success == false) {
                     this.alertService.error(data.message);
                    } else { 
                      console.log("dsfdsfdsf");
                     this.alertService.success(data.message);
                     var returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home/new';
                     this.router.navigate([returnUrl]);
                    } 

                },
                error => {
                    this.alertService.error(error);
                });

     } 

  }

}