import {AbstractControl} from '@angular/forms';
export class TypeValidation {

    static MatchType(AC: AbstractControl) {
       let type = AC.get('type').value; // to get value in input tag
       //let link= AC.get('link').value; // to get value in input tag
       //let desc = AC.get('desc').value; // to get value in input tag
        if(type == 'text') {
            console.log('false');
            AC.get('desc').setErrors( { required : true } )
            AC.get('link').setErrors( { required : false } )
        } else {
            AC.get('desc').setErrors( { required : false } )
            AC.get('link').setErrors( { required : true } )
        }
    }
}