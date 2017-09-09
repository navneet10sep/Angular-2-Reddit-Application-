<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Api extends CI_Controller {

    public function __construct(){    

        parent::__construct();

        //Handling Angular2 http client preflight request 
        if (strtolower($_SERVER['REQUEST_METHOD']) === 'options') {
                 header('Access-Control-Allow-Origin: *');
                 header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
                 header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Range, Content-Disposition, Content-Type, Authorization');
                 header('Access-Control-Allow-Credentials: true');
                 echo 'Allowed';
                 
        } else { 
        header('Access-Control-Allow-Origin: *'); //Allow all origins 
        }
        
        //Load libraries and models used by this controller
        $this->load->library('form_validation');
        $this->load->helper('form');
        $this->load->model("Auth");
        $this->load->model("Reddit");
        $this->load->model("Errorservice");

    }

    /* Login Action Handler Starts */
	public function login()
	{
         header("Content-Type: application/json");

         //Angular2 http client send the JSON requests, not the x-form-encoded
         //so i will populate the $_POST array with the request data so codeigniter can run validations 
		 $_POST = json_decode(file_get_contents('php://input'), true);

                $this->form_validation->set_rules('username', 'Username', 'required');
                $this->form_validation->set_rules('password', 'Password', 'required');
 
                if ($this->form_validation->run() == FALSE) {
                    
                    //frontend do validation also, So no need to show errors for individual input field  
                    $this->Errorservice->translateCode("INVALID_REQUEST");
             
                } else {

                      // Authunticate Model will handle if user password not matched, user not exit 
                      // $this->input->post - will automatically parse value for XSS, SQL Injection attacks 
                      $response = $this->Auth->login($this->input->post("username"),$this->input->post("password"));

                      if($response) {
                        echo json_encode(array( 'success' => true, 'message' => "Login successfull!", 'data' => $response  ));
                      } 
                }

	}
    /* Login Action Handler Ends */


    /* User registeration starts */
    public function register(){
        
        header("Content-Type: application/json");
        $_POST = json_decode(file_get_contents('php://input'), true);

                $this->form_validation->set_rules('username', 'Username', 'required');
                $this->form_validation->set_rules('password', 'Password', 'required|min_length[6]|max_length[20]'); // Password Policy same as validation in Angular
                $this->form_validation->set_rules('fullName', 'fullname', 'required');
                $this->form_validation->set_rules('address', 'address', 'required');
                $this->form_validation->set_rules('city', 'city', 'required');
                $this->form_validation->set_rules('country', 'country', 'required');
 
                if ($this->form_validation->run() == FALSE) {
                    
                    //frontend do validation also, So no need to show errors for individual input field  
                    $this->Errorservice->translateCode("INVALID_REQUEST");
             
                } else {

                      // Authunticate Model will handle if user password not matched, user not exit 
                      // $this->input->post - will automatically parse value for XSS, SQL Injection attacks 
 
                       $response = $this->Auth->register(

                                         $this->input->post("username"),
                                         $this->input->post("password"),
                                         $this->input->post("fullName"),
                                         $this->input->post("address"),
                                         $this->input->post("city"),
                                         $this->input->post("country") 
                                        
                        );


                      if($response == true) {
                        echo json_encode(array( 'success' => true, 'message' => "Registeration successfull!"  ));
                      } 
                }

    }
    /* User registeration ends */

    /* post submit starts */
    public function createpost(){

       
         header("Content-Type: application/json");
         $_POST = json_decode(file_get_contents('php://input'), true);
         $userData = $this->Auth->getUserData($_POST['token']);    
        if( $userData ) { //user logged in, token verified
        if ($this->postmodel_check($_POST['postData']) == false) {

        //frontend do validation also, So no need to show errors for individual input field  
        $this->Errorservice->translateCode("INVALID_REQUEST");

        } else {

        if( $this->Reddit->post($_POST['postData'],$userData->id) == true ) {
         echo json_encode(array( 'success' => true, 'message' => "Post submitted sucessfully!" ));
        } 

        }

        }

    }
    /* post submit ends */

    //Custom Validation to check post type 
    public function postmodel_check($postDataset) {

        //Check if Post type is Text or Link 
        //if Text then must have description min 10 chars  
        //if Link then must have valid http link  
        $postData =  $postDataset['postType'];
        if($postData['type'] == 'text' && strlen($postData['text']['desc']) >= 10 ) {
            return true;
        }  else if($postData['type'] == 'link' && $this->is_valid_url($postData['link']['link'] ) ) {
          return true;
        } else { 
          $this->form_validation->set_message('postmodel_check', 'invalid post data');
          return false;
        }

    }


function is_valid_url($url) {
    // First check: is the url just a domain name? (allow a slash at the end)
    $_domain_regex = "|^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*(\.[A-Za-z]{2,})/?$|";
    if (preg_match($_domain_regex, $url)) {
        return true;
    }

    // Second: Check if it's a url with a scheme and all
    $_regex = '#^([a-z][\w-]+:(?:/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))$#';
    if (preg_match($_regex, $url, $matches)) {
        // pull out the domain name, and make sure that the domain is valid.
        $_parts = parse_url($url);
        if (!in_array($_parts['scheme'], array( 'http', 'https' )))
            return false;

        // Check the domain using the regex, stops domains like "-example.com" passing through
        if (!preg_match($_domain_regex, $_parts['host']))
            return false;

        // This domain looks pretty valid. Only way to check it now is to download it!
        return true;
    }

    return false;
}

public function getposts(){

       header("Content-Type: application/json");
      
       //Applying validations  
       if ( in_array($_REQUEST['category'], $this->Reddit->categories) 
            && $this->valid_pager($_REQUEST['start']) 
            &&  $this->valid_pager($_REQUEST['end']) 
       ) {    
    
        $results = $this->Reddit->getPosts(
                                           $this->input->get('category'),
                                           $this->input->get('start'),
                                           $this->input->get('end'),
                                           $this->input->get('search')
                                           );

        echo json_encode(array( 'success' => true , 'data' => $results['data'] , 'rows' => $results['rows'] ));
  
       } else { 
       $this->Errorservice->translateCode("INVALID_REQUEST");
       }
}

public function valid_pager($value){ //Page number should be positive or zero number
 return ((is_int($value) || ctype_digit($value)) && (int)$value >= 0 ) ? true : false;
}

public function vote(){

        header("Content-Type: application/json");
        $_POST = json_decode(file_get_contents('php://input'), true);

         $userData = $this->Auth->getUserData($this->input->post('token'));    
        if( $userData ) { //user logged in, token verified
                
                //We wil apply following validation for the Post id in the posts Model 
                // Check if post id exist in th db 
                // Check if the request user has not already given the vote with same action 
                // User can Vote up and down one time only, 
                // if user vote down after hitting Up then that up will be convert to down, vice versa 
                $this->form_validation->set_rules('id', 'id', 'required');
                $this->form_validation->set_rules('action', 'action', 'required');

                if ($this->form_validation->run() == FALSE) {
                    
                    //frontend do validation also, So no need to show errors for individual input field  
                   $this->Errorservice->translateCode("INVALID_REQUEST");
             
                } else {
 
                   
                  if( $this->Reddit->vote($this->input->post("id"),$this->input->post("action"),$userData->id) == true ) {

                    $votesInfo = $this->Reddit->getVotesInfo( $this->input->post("id") );

                   echo json_encode(array( 'success' => true, 'action' => true ,  'message' => "Post voted sucessfully!" , 'votesUps' => $votesInfo['votesUps']." " , 'votesDowns' => $votesInfo['votesDowns']." " ));
                  } 

                }

        }  

}
 
    //Validation if the post action is correct 
    public function callback_valid_action($action) {
       return ( $acton == "up" || $action == "down" ) ? true : false;
    }



}
