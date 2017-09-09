<?php
class Auth extends CI_Model
{

	public function __construct(){
	 parent::__construct();
	 $this->load->model("Errorservice");
	}

	public function login($username,$password){

        $userData = $this->db->from('users')
                             ->where(array('email' => $username))
                             ->get()->row();
        if($userData) {

           if($userData->password == $password) {
             //Prepare repsond data , send only safe & required information 
             $response = array( 
             	              'fullName' => $userData->name, 
             	              'username' => $userData->email, 
             	              'address'  => $userData->address, 
             	              'city'     => $userData->city, 
             	              'country'  => $userData->country 
             	              );

            $token = array();
            $token['id'] = $userData->id; //Better to create a secret for each client instead id
            $response['token'] = JWT::encode($token, $this->config->item('jwt_key'));

            //Saving JWT toeken in the database, Not have much time to implemnt the proper authuntication guards, Best practive will be use of key managment server like Redis to store auth  keys  
            $this->db->where('id',$userData->id)->update('users',array( 'jwt' => $response['token'] ));
            
            return $response;
           } else { 
           	$this->Errorservice->translateCode("NOT_AUTHORIZED"); //Incorrect Username or Password 
           } 

        } else { 
        	$this->Errorservice->translateCode("USER_NOT_EXIST"); 
        }

	}

  public function getUserData($token){

    $userData = $this->db->where('jwt',$token)->get("users");
    if($userData->num_rows() == 1) {
      return $userData->row();
    } else { 
       $this->Errorservice->translateCode("UNAUHORIZED_REQUEST"); 
    }
  
  }

	public function register($username,$password,$fullName,$address,$city,$country) { 

        //check if username already exist 
        $userData = $this->db->from('users')
                             ->where(array('email' => $username))
                             ->get()->row();
        if(!$userData) {

             $data = array(
                      'email'    => $username,
                      'password' => $password, // Not Encrypting Password, Offcourse no time for this 
                      'name'     => $fullName, 
                      'address'  => $address, 
                      'city'     => $city, 
                      'country'  => $country,
                      'dt'       => date("Y-m-d H:i:s"),
                      'ipaddress' => $_SERVER['REMOTE_ADDR'],
             	     );

             $this->db->insert("users",$data);

             if($this->db->affected_rows() > 0 ) {
             return true;
             } else { 

               //very rarely happen, this can be due to overloaded database server
              //Good to log such events 
              error_log("Code: Unable to create the user for email address:" . $username, 3, "/var/tmp/my-errors.log");
              $this->Errorservice->translateCode("FAILED_TO_CREATE_USER"); 
             }

        } else { 
        	$this->Errorservice->translateCode("USER_ALREADY_EXIST"); 
        }
	
  }

}


?>