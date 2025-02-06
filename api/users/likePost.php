<?php



if($_SERVER['REQUEST_METHOD'] == 'POST'){

    function likePost(){    


        include_once "../auth/isAdmin.php";
    
        if($flag['status'] == false){
            $response['status'] = false;
            $response['error'] = true;
            return $response;
        }

        $data = json_decode(file_get_contents('php://input'));

        $post_id = $data->post_id;

    
        $sql = "SELECT * FROM likes WHERE post_id = ? AND user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $post_id, $_SESSION['id']);
        $stmt->execute();
        $result = $stmt->get_result();
        // echo json_encode($result);
        if (mysqli_num_rows($result) > 0) {

            $row = $result->fetch_assoc();
            
            $deleteSql = "DELETE FROM likes WHERE post_id = ? AND user_id = ?";
            $deleteStmt = $conn->prepare($deleteSql);
            $deleteStmt->bind_param("ss", $post_id, $_SESSION['id']);
            $deleteStmt->execute();
            
            $deleteStmt->close();
            $response['status'] = 201;
            $response['message'] = "Post unliked successfully";
            
            

        } else {
            $insertSql = "INSERT INTO likes(post_id, user_id) VALUES (?,?)";
            $insertStmt = $conn->prepare($insertSql);
            $insertStmt->bind_param("ss", $post_id, $_SESSION['id']);
            $insertStmt->execute();
            $insertStmt->close();
            $response['status'] = 201;
            $response['message'] = "Post liked successfully";

            $post_author_id = getPostAuthorId($post_id);
            $notificationSql = "INSERT INTO notifications(user_id, type, source_id, post_id) VALUES ( ? , 'like' , ? , ? )";
            $notificationStmt = $conn->prepare($notificationSql);
            $notificationStmt->bind_param("sss",$post_author_id, $_SESSION['id'] ,  $post_id);
            $notificationStmt->execute();
            $notificationStmt->close();
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
    echo json_encode(likePost());
}else {
    http_response_code(500);
    echo json_encode([
        'status' => 500,
        'message' => 'Incorrect method'
    ]);
}

?>