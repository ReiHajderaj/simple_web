<?php



if($_SERVER['REQUEST_METHOD'] == 'POST'){

    function createPost(){    


        include_once "../auth/isAdmin.php";
    
        if($flag['status'] == false){
            $response['status'] = false;
            $response['error'] = true;
            return $response;
        }

        $data = json_decode(file_get_contents('php://input'));

        $title = $data->title;
        $content = $data->content;

        $sql = "INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sss", $title, $content, $_SESSION['id']);
        $stmt->execute();

        if($stmt->affected_rows > 0){
            $response['status'] = 201;
            $response['message'] = 'Post created successfully';
            
        } else {
            $response['status'] = 400;
            
            $response['message'] = 'Failed to create post try again later';
        }

        $stmt->close();
        $conn->close();
        return $response;
    }
        
    echo json_encode(createPost());
}else {
    http_response_code(500);
    echo json_encode([
        'status' => 500,
        'message' => 'Incorrect method'
    ]);
}

?>