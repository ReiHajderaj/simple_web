<?php



if($_SERVER['REQUEST_METHOD'] == 'POST'){

    function getComments(){    


        include_once "../auth/isAdmin.php";
    
        if($flag['status'] == false){
            $response['status'] = false;
            $response['error'] = true;
            return $response;
        }

        $data = json_decode(file_get_contents('php://input'));

        $post_id = $data->post_id;

        $response = [
            'status' => '',
            'message' => [],
        ];
        // return $post_id;

    
        $sql = "SELECT * FROM `comments` WHERE `post_id` =  ? ORDER BY created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $post_id);
        $stmt->execute();
        $result = $stmt->get_result();
        // echo json_encode($result);
        $response['status'] = 201;
        while ($row = $result->fetch_assoc()) {
            $response['message'][] = $row;
        }

        $stmt->close();
        $conn->close();
        return $response;
    }
    echo json_encode(getComments());
}else {
    http_response_code(500);
    echo json_encode([
        'status' => 500,
        'message' => 'Incorrect method'
    ]);
}

?>