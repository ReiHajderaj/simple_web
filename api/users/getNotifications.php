<?php



if($_SERVER['REQUEST_METHOD'] == 'GET'){

    function getUsers(){    
        include_once "../auth/isAdmin.php";
    
        if($flag['status'] == false){
            $response['status'] = false;
            $response['error'] = true;
            return $response;
        }
    
        $sql = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $_SESSION['id']);
        $stmt->execute();
        $result = $stmt->get_result();
        $notification = $result->fetch_all(MYSQLI_ASSOC);
        return $notification;
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