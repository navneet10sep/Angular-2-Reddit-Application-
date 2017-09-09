<?php

class Reddit extends CI_Model 
{
  public $categories = array("hot","new");
  public $postsPerPage = 10;

  public $voteActions = array (
    'up' => 1, 
    'down' => 0,
  );

	public function post($postDataset,$userId){ 

       $postData =  $postDataset['postType'];
       $data = array(
              'title' => $this->db->escape_str($postDataset['title']),
              'type'  => $this->db->escape_str($postData['type']), 
              'desc'  => ( $postData['type'] == 'text' ) ? $this->db->escape_str($postData['text']['desc']) : '', 
              'link'  => ( $postData['type'] == 'link' ) ? $this->db->escape_str($postData['link']['link']) : '',
	          'dt'       => date("Y-m-d H:i:s"),
	          'ipaddress' => $_SERVER['REMOTE_ADDR'],
	          'userId'    => $userId
       	);

       $this->db->insert("posts",$data);

             if($this->db->affected_rows() > 0 ) {
             return true;
             } else { 
               //very rarely happen, this can be due to overloaded database server
              //Good to log events 
              error_log("Unable to create new post", 3, "/var/tmp/my-errors.log");
              $this->Errorservice->translateCode("FAILED_TO_CREATE_POST"); 
             }
       
	}

  public function getPosts($category, $start, $end , $search = false) {

  if(trim($search) == "") { $search = false; }

   $sql = "SELECT *, ( SELECT name FROM users WHERE id = ps.userId ) AS userName, "
        ." ( SELECT city FROM users WHERE id = ps.userId ) AS userCity, "
        ." ( SELECT country FROM users WHERE id = ps.userId ) AS userCountry, "
        ." ( SELECT count(*) FROM votes WHERE postId = ps.id AND action = 1 ) AS voteUps, "
        ." ( SELECT count(*) FROM votes WHERE postId = ps.id AND action = 0) AS voteDowns "
 
         ." FROM posts as ps ";

    // search query 
    if($search != false) {
      $sql .= " WHERE ps.title LIKE '%". $search ."%' ";
    }

    //if New then load all the posts by date in descending order
    if( $category == "new" ) { 
      $sql .= " ORDER BY ps.dt DESC ";
    }

    // Hot then load all the post by the having mosts votes and having most votes down as second priority
    if( $category == "hot" ) { 
      $sql .= " ORDER BY voteUps DESC, voteDowns DESC ";
    }

    //Calculate total rows without limiting them for the pagination 
    $totalRows = $this->db->query($sql)->num_rows();

    //Limit Clause 
    $sql .= " LIMIT ". $start . ", ". $this->postsPerPage;
 
   $results = $this->db->query($sql);

   if($results->num_rows() == 0) {
   return array ( 'data' => array() , 'rows' => 0 );
   } else { 
     
      //remove confidential data that should not be send to the client 
      foreach( $results->result() as $r ){
      
        unset($r->userId);
        unset($r->ipaddress);

        //Convert post time to X hours ago format
        $r->postDate = $this->time_elapsed_string($r->dt);


      }

 
   return array ( 'data' => $results->result() , 'rows' => $totalRows );
   }
   
  }

  public function getVotesInfo($postId) {
       
       $votesUps = $this->db->where( array('postId' => $postId , 'action' => 1 ) )
                        ->get("votes")->num_rows();

       $votesDown = $this->db->where( array('postId' => $postId , 'action' => 0 ) )
                          ->get("votes")->num_rows();

  return array( 'votesUps' => $votesUps  , 'votesDowns' => $votesDown );
  }

  public function vote($id,$action,$userId)
  {
     //Check if valid post if 
     $valid = $this->db->where("id",$id)->get("posts");
     //I am allowing users to vote up their own post, but just for once 
     
     if($valid->num_rows() == 1) {

      //check if user have already voted with the same action 
      $alreadyVoted = $this->db->where( array(
                                       'userId' => $userId,
                                       'postId' => $id
                                      ))->get("votes");
      
      if($alreadyVoted->num_rows() > 0) {

         if($alreadyVoted->row()->action == $this->voteActions[$action]) {
           
           //vote action can be taken back 
          $this->db->where('id',$alreadyVoted->row()->id)->delete("votes");
 
         return true;
         } else { 
          
            //Vote changed by the user
            $this->db->where('id',$alreadyVoted->row()->id)->update("votes",array( 'action' => $this->voteActions[$action] ));
         
         return true;
         }

      } else {

            $data = array(
                             'postId' => $id, 
                             'action' => $this->voteActions[$action], 
                             'ipaddress' => $_SERVER['REMOTE_ADDR'],
                             'userId'    => $userId,
                             'ipaddress' => $_SERVER['REMOTE_ADDR'],
                             'dt'        => date("Y-m-d H:i:s")
                         );

             $this->db->insert("votes",$data);

             if($this->db->affected_rows() > 0) {
              return true;
             } else { 
               error_log("Unable to vote post with id" . $id, 3, "/var/tmp/my-errors.log");
               $this->Errorservice->translateCode("FAILED_TO_VOTE_POST"); 
               
             }
 
      }

     } else { 
     $this->Errorservice->translateCode("INVALID_REQUEST"); 
     } 

  }


  public function time_elapsed_string($datetime, $full = false) {
      $now = new DateTime;
      $ago = new DateTime($datetime);
      $diff = $now->diff($ago);

      $diff->w = floor($diff->d / 7);
      $diff->d -= $diff->w * 7;

      $string = array(
          'y' => 'year',
          'm' => 'month',
          'w' => 'week',
          'd' => 'day',
          'h' => 'hour',
          'i' => 'minute',
          's' => 'second',
      );
      foreach ($string as $k => &$v) {
          if ($diff->$k) {
              $v = $diff->$k . ' ' . $v . ($diff->$k > 1 ? 's' : '');
          } else {
              unset($string[$k]);
          }
      }

      if (!$full) $string = array_slice($string, 0, 1);
      return $string ? implode(', ', $string) . ' ago' : 'just now';
  }


}

?>