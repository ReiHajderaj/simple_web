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

        $current = $data->current;
        $new = password_hash($data->new, PASSWORD_BCRYPT);

    
        $sql = "SELECT password_hash FROM users WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $_SESSION['id']);
        $stmt->execute();
        $result = $stmt->get_result();
        // echo json_encode($result);
        if (mysqli_num_rows($result) > 0) {

            $row = $result->fetch_assoc();

            if(password_verify($current, $row['password_hash'])){
                $updateSql = "UPDATE `users` SET `password_hash`= ? WHERE id = ? ";
                $updateStmt = $conn->prepare($updateSql);
                $updateStmt->bind_param("ss", $new, $_SESSION['id']);
                $updateStmt->execute();
                if($updateStmt->affected_rows > 0) {
                    $response['status'] = 201;
                    $response['message'] = "Password updated successfully";
                } else {
                    $response['status'] = 403; 
                    $response['message'] = "Password update failed try again later";
                }
                $updateStmt->close();
            } else {
                $response['status'] = 403; 
                $response['message'] = "Current password is incorrect";
            }
            
            
            

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