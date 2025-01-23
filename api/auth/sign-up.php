<?php
header('Content-Type: application/json');



if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Function to handle sign up
    function SignUp() {
        // Get the JSON data
        $data = json_decode(file_get_contents('php://input'));
        
        // Validate that all required fields exist
        if (!isset($data->fullname) || !isset($data->email) || !isset($data->password)) {
            return array(
                'status' => 400,
                'message' => 'Missing required fields'
            );
        }

        
        $fullname = filter_var($data->fullname, FILTER_SANITIZE_STRING);
        $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
        $password = password_hash($data->password, PASSWORD_BCRYPT);
        // return $password;

        if(strlen($fullname) < 6 || strlen($email) < 6 || strlen($data->password) < 8) {
            return array(
                'status' => 400,
                'message' => 'Invalid Credentials: Name and email must be at least 6 characters, password at least 8 characters'
            );
        }

        try {
            include '../database.php';
            
            
            // Use prepared statements to prevent SQL injection
            $stmt = $conn->prepare("INSERT INTO users (username, email, password_hash, profile_image_url) VALUES (?, ?, ?, 'default.png')");
            // return $password;
            $stmt->bind_param("sss", $fullname, $email, $password);
            // return $stmt->;
            if ($stmt->execute()) {

                $_SESSION['id'] = $stmt->insert_id;
                $_SESSION['user'] = $fullname;
                $_SESSION['email'] = $email;
                return array(
                    'status' => 201,
                    'message' => 'Sign up successful',
                    // 'image' => 'default.png'

                );

            } else {
                return array(
                    'status' => 500,
                    'message' => 'Database error occurred'
                );
            }
        } catch (Exception $e) {
            return array(
                'status' => 500,
                'message' => 'Error occurred: ' . $e->getMessage()
            );
        } finally {
            $stmt->close();
            $conn->close();
        }
    }

    echo json_encode(SignUp());
} else {
    http_response_code(500);
    echo json_encode([
        'status' => 500,
        'message' => 'Incorrect method',
        
    ]);
}
