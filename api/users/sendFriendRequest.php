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

        $username = $data->username;

    
        $sql = "SELECT id FROM users WHERE username = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        // echo json_encode($result);
        if (mysqli_num_rows($result) > 0) {

            $row = $result->fetch_assoc();
            
            $insertSql = "INSERT INTO `notifications`(`user_id`, `type`, `source_id`, `is_read`) VALUES (?,'friend_request',?,0)";
            $insertStmt = $conn->prepare($insertSql);
            $insertStmt->bind_param("ss", $row['id'], $_SESSION['id']);
            $insertStmt->execute();
            if($insertStmt->affected_rows > 0) {
                $response['status'] = true;
                $response['message'] = "Friend request sent successfully";
            } else {
                $response['status'] = false; 
                $response['message'] = "Server error try again later";
            }
            $insertStmt->close();
            

        } else {
            $response['status'] = false;
            $response['message'] = "Username not found";
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