<?php

if($_SERVER['REQUEST_METHOD'] == 'GET'){

    function getUsers(){    
        include_once "../auth/isAdmin.php";

        if($flag['status'] == false){
            $response['status'] = false;
            $response['error'] = true;
            return $response;
        }
        

        // Missing semicolon here after the SQL query
        $sql = "SELECT * FROM friends WHERE user_id_1 = ? OR user_id_2 = ? ORDER BY created_at DESC"; 
        // return $_SESSION['id'];
        $response = [
            'status' => '',
            'error' => '',
            'message' => [],
        ];

        try {
            // Prepare the statement
            $stmt = $conn->prepare($sql);  
            $stmt->bind_param("ss", $_SESSION['id'], $_SESSION['id']);
            $stmt->execute();


                
                $response['status'] = 201;
                $result = $stmt->get_result();
                

                while($row = $result->fetch_assoc()) {
                    
                    
                    if($row['user_id_1'] == $_SESSION['id']){
                        
                        $response['message'][] = $row['user_id_2'];
                    } else {
                        
                        $response['message'][] = $row['user_id_1'];
                    }
                }


        } catch (Exception $e) {
            // Handle any errors
            $response['status'] = 500;
            $response['message'] = 'Error: ' . $e->getMessage();
        } finally {
            // Close resources
            $stmt->close();
            $conn->close();
            return $response;
        }
    }

    // Call the function and echo the result as JSON
    echo json_encode(getUsers());

} else {
    http_response_code(500);
    echo json_encode([
        'status' => 500,
        'message' => 'Incorrect method'
    ]);
}
?>
