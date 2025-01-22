<?php



if($_SERVER['REQUEST_METHOD'] == 'POST'){

    function getUsers(){    


        include_once "../auth/isAdmin.php";
    
        if($flag['status'] == false){
            $response['status'] = false;
            $response['error'] = true;
            return $response;
        }

        $data = json_decode(file_get_contents('php://input'));

        $sender = $data->sender;
        $type = $data->type;
        $response = array();

        if($type == 'accept'){
            $insertSql = "INSERT INTO `friends`(`user_id_1`, `user_id_2`) VALUES (?,?)";
            $insertStmt = $conn->prepare($insertSql);
            $insertStmt->bind_param("ss", $_SESSION['id'], $sender);
            $insertStmt->execute();
            
            if($insertStmt->affected_rows === 0){
                $response['status'] = 400;
                $response['message'] = "Was not able to accept friend request";
            }
            $insertStmt->close();

        }
        $sql = "DELETE FROM `notifications` WHERE `user_id` = ? AND `source_id` = ? AND `type` = 'friend_request'";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ss", $_SESSION['id'], $sender);
            $stmt->execute();
            if($stmt->affected_rows > 0){
                if(!isset($response['status'])){
                $response['status'] = 201;
                $response['message'] = "Action completed successfully";
                }
            }
    
        
       

        $stmt->close();
        $conn->close();
        return $response;
    }
    echo json_encode(getUsers());
}else {
    http_response_code(500);
    echo json_encode([
        'status' => 500,
        'message' => 'Incorrect method'
    ]);
}

?>