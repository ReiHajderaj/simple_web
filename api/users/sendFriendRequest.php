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

        // Check if user is trying to send request to themselves
        

        $sql = "SELECT id FROM users WHERE username = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        // echo json_encode($result);
        if (mysqli_num_rows($result) > 0) {
            $row = $result->fetch_assoc();

            if($row['id'] === $_SESSION['id']) {
                $response['status'] = 400;
                $response['message'] = "You cannot send a friend request to yourself";
                return $response;
            }
            
            // Check if they are already friends
            $checkFriendsSql = "SELECT * FROM friends WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)";
            $checkStmt = $conn->prepare($checkFriendsSql);
            $checkStmt->bind_param("iiii", $_SESSION['id'], $row['id'], $row['id'], $_SESSION['id']);
            $checkStmt->execute();
            $friendResult = $checkStmt->get_result();
            
            if(mysqli_num_rows($friendResult) > 0) {
                $response['status'] = 400;
                $response['message'] = "You are already friends with this user";
                $checkStmt->close();
                return $response;
            }
            $checkStmt->close();

            // Check if a friend request notification already exists
            $checkNotifSql = "SELECT * FROM notifications WHERE user_id = ? AND type = 'friend_request' AND source_id = ?";
            $checkNotifStmt = $conn->prepare($checkNotifSql);
            $checkNotifStmt->bind_param("ii", $row['id'], $_SESSION['id']);
            $checkNotifStmt->execute();
            $notifResult = $checkNotifStmt->get_result();
            
            if(mysqli_num_rows($notifResult) > 0) {
                $response['status'] = 400;
                $response['message'] = "You have already sent a friend request to this user";
                $checkNotifStmt->close();
                return $response;
            }
            $checkNotifStmt->close();

            $insertSql = "INSERT INTO `notifications`(`user_id`, `type`, `source_id`) VALUES (?,'friend_request',?)";
            $insertStmt = $conn->prepare($insertSql);
            $insertStmt->bind_param("ss", $row['id'], $_SESSION['id']);
            $insertStmt->execute();
            if($insertStmt->affected_rows > 0) {
                $response['status'] = 201;
                $response['message'] = "Friend request sent successfully";
            } else {
                $response['status'] = 500; 
                $response['message'] = "Server error try again later";
            }
            $insertStmt->close();
            

        } else {
            $response['status'] = 404;
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