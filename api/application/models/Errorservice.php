<?php

/* Errorservice , better name for this could be errorService with Camel cases 
, but codeingnier enforce naming conventions for controller and models 
*/

class Errorservice extends CI_Model 
{
  public $errorCodes; 

  public function __construct() {

  	$this->errorCodes = array(

  		                  'INVALID_REQUEST' => "Invalid Request",
  		                  'NOT_AUTHORIZED'  => "Incorrect Username or Password",
  		                  'USER_NOT_EXIST' => "There is no account associated for this username with us",
                        'FAILED_TO_CREATE_USER' => "Unable to register, Please contact administrator", 
                        'FAILED_TO_CREATE_POST' => "Unable to submit this post, Please contact administrator", 
  		                  'FAILED_TO_VOTE_POST' => "Unable to vote this post, Please try again", 
                        'USER_ALREADY_EXIST'  => "This email is already register with us",
                        'UNAUHORIZED_REQUEST'  => "Malformed Request Data",
  		                   
  		                );
  
  }

  public function translateCode($code){

  	 if($this->errorCodes[$code]) {
      
      //Send Error to the Client 
      echo json_encode(array( "success" => false , "message" => $this->errorCodes[$code] ));
      exit();

  	 } else { 

           // If Code not exist then it is applicaiton specific error 
  	 	   // If oragnization have logs managment policy, then this error can be logged into the error files 
  	 	   // Angular2 app have alert services to handle this exception 
           error_log("Code: ". $code ." do not exist in Error Servvices", 3, "/var/tmp/my-errors.log");
  	 	   header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error :  Invalid Error Code ', true, 500);
           exit();
  	 }
  }


}


?>