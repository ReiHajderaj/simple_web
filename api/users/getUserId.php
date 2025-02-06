<?php

if($_SERVER['REQUEST_METHOD'] == 'POST'){
    
    function getUsers(){    
        try {
            include_once "../auth/isAdmin.php";
            $response = array();
        
            if($flag['status'] == false){
                $response['status'] = 403;
                $response['message'] = 'Unauthorized access';
                return $response;
            }

            $data = json_decode(file_get_contents('php://input'));
            
            $id = $data->id;
        
            
          
        
            $sql = "SELECT `id`, `username`, `email`, `profile_image_url`, `bio` FROM users WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if($result->num_rows > 0){
                $response['status'] = 201;
                $response['message'] = $result->fetch_assoc();
            } else {
                $response['status'] = 404;
                $response['message'] = 'User not found';
            }

        } catch (Exception $e) {
            $response['status'] = 500;
            $response['message'] = 'Error: ' . $e->getMessage();
        } finally {
           
                $stmt->close();
          
                $conn->close();
                return $response;

        }
        
    }
    
    echo json_encode(getUsers());
    
} else {
    http_response_code(405);
    echo json_encode([
        'status' => 405,
        'message' => 'Method Not Allowed'
    ]);
}

?>