<?php



if($_SERVER['REQUEST_METHOD'] == 'POST'){

    function getNrLikes(){    


        include_once "../auth/isAdmin.php";
    
        if($flag['status'] == false){
            $response['status'] = false;
            $response['error'] = true;
            return $response;
        }

        $data = json_decode(file_get_contents('php://input'));

        $post_id = $data->post_id;

    
        $sql = "SELECT COUNT(*) FROM likes WHERE post_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $post_id);
        $stmt->execute();
        $result = $stmt->get_result();
        // echo json_encode($result);
        if (mysqli_num_rows($result) > 0) {

            $row = $result->fetch_assoc();
            $response['status'] = 201;
            $response['message'] = $row['COUNT(*)'];
            
            

        } else {
            $response['status'] = 404;
            $response['message'] = "Post not found";
        }

        $stmt->close();
        $conn->close();
        return $response;
    }
    echo json_encode(getNrLikes());
}else {
    http_response_code(500);
    echo json_encode([
        'status' => 500,
        'message' => 'Incorrect method'
    ]);
}

?>