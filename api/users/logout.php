<?php
header('Content-Type: application/json');



if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Function to handle sign up
    function logout() {
        
        
        // if(isset($_SESSION['id'])){
            session_unset(); // Clear all session variables
            session_destroy(); // Destroy the session
            session_start(); // Start a new session to ensure proper destruction
            session_destroy(); // Destroy again to be thorough
            
            return array(
                'status' => 200,
                'message' => 'Logged out successfully'
            );
        // } else {
        //     return array(
        //         'status' => 401,
        //         'message' => 'No active session found'
        //     ); 
        // }
    }
    echo json_encode(logout());
    
} else {
    http_response_code(500);
    echo json_encode([
        'status' => 500,
        'message' => 'Incorrect method'
    ]);
}
