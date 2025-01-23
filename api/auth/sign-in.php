<?php
header('Content-Type: application/json');



if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Function to handle sign up
    function SignIn() {
        // Get the JSON data
        $data = json_decode(file_get_contents('php://input'));
        
        // Validate that all required fields exist

        
        
        $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
        $password = filter_var($data->password, FILTER_SANITIZE_STRING);
        // return $password;

        if(strlen($email) < 6 || strlen($password) < 8) {
            return array(
                'status' => 400,
                'message' => 'Invalid Credentials: Username must be at least 6 characters, password at least 8 characters'
            );
        }

        try {
            include '../database.php';
            
            
            // Use prepared statements to prevent SQL injection
            $stmt = $conn->prepare("SELECT * FROM users WHERE `email` = ? OR `username` = ?");
            $stmt->bind_param("ss", $email, $email);
            
            if (!$stmt->execute()) {
                return array(
                    'status' => 500,
                    'message' => 'Database error occurred'
                );
            }
            
            $result = $stmt->get_result();
            
            if ($row = $result->fetch_assoc()) {
                if (password_verify($password, $row['password_hash'])) {
                    $_SESSION['id'] = $row['id'];
                    $_SESSION['user'] = $row['username'];
                    $_SESSION['email'] = $row['email'];
                    
                    return array(
                        'status' => 201,
                        'message' => 'Sign in successful',
                        // 'image' => $row['profile_image_url']
                    );
                } else {
                    return array(
                        'status' => 401,
                        'message' => 'Invalid password'
                    );
                }
            }
                return array(
                    'status' => 401,
                    'message' => 'Username or email not found'
                );
            
        } catch (Exception $e) {
            return array(
                'status' => 500,
                'message' => 'Error occurred: ' . $e->getMessage()
            );
        }
    }

    echo json_encode(SignIn());
} else {
    http_response_code(500);
    echo json_encode([
        'status' => 500,
        'message' => 'Incorrect method'
    ]);
}
