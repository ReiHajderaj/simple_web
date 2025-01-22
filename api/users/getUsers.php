<?php



if($_SERVER['REQUEST_METHOD'] == 'GET'){

    function getUsers(){    
        include_once "../auth/isAdmin.php";
    
        if($flag['status'] == false){
            $response['status'] = false;
            $response['error'] = true;
            return $response;
        }
    
        $sql = "SELECT `id`, `username`, `email`, `profile_image_url`, `bio` FROM users";
        $result = $conn->query($sql);
        $friends = $result->fetch_all(MYSQLI_ASSOC);
        return $friends;
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