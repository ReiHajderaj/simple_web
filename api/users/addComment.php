<?php



if($_SERVER['REQUEST_METHOD'] == 'POST'){

    function addComment(){    


        include_once "../auth/isAdmin.php";
    
        if($flag['status'] == false){
            $response['status'] = false;
            $response['error'] = true;
            return $response;
        }

        $data = json_decode(file_get_contents('php://input'));

        $post_id = $data->post_id;
        $comment = $data->comment;
    
        $sql = "INSERT INTO comments(post_id, user_id, content) VALUES (?,?,?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sss", $post_id, $_SESSION['id'], $comment);
        $stmt->execute();
        
        // echo json_encode($result);
        if ($stmt->affected_rows > 0) {

            $response['status'] = 201;
            $response['message'] = "Comment added successfully";
            $post_author_id = getPostAuthorId($post_id);
            $notificationSql = "INSERT INTO notifications(user_id, type, source_id, post_id) VALUES ( ? , 'comment' , ? , ? )";
            $notificationStmt = $conn->prepare($notificationSql);
            $notificationStmt->bind_param("sss",$post_author_id, $_SESSION['id'],  $post_id);
            $notificationStmt->execute();
            $notificationStmt->close();
  

        } else {
            $response['status'] = 400;
            $response['message'] = "Comment not added";
        }

        $stmt->close();
        $conn->close();
        return $response;
    }

    function getPostAuthorId($post_id){
        include "../database.php";
        $sql = "SELECT user_id FROM posts WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $post_id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc()['user_id'];
    }

    echo json_encode(addComment());
}else {
    http_response_code(500);
    echo json_encode([
        'status' => 500,
        'message' => 'Incorrect method'
    ]);
}

?>