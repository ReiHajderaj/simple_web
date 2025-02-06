<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    function sendMessage() {
        include_once "../auth/isAdmin.php";

        if ($flag['status'] == false) {
            return array(
                'status' => 403,
                'error' => true,
                'message' => 'Unauthorized access'
            );
        }

        $id = $_SESSION['id'];

        $data = json_decode(file_get_contents('php://input'));
        $recipient_id = $data->recipient_id;
        $content = $data->content;

        // Fetch the list of friend IDs
        

      
    
        $messagesSql = "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)";
        $messagesStmt = $conn->prepare($messagesSql);
        $messagesStmt->bind_param("sss", $id, $recipient_id, $content);
        $messagesStmt->execute();
        if($messagesStmt->affected_rows > 0){

            $notificationSql = "INSERT INTO notifications(user_id, type, source_id, post_id) VALUES ( ? , 'message' , ? , ? )";
            $notificationStmt = $conn->prepare($notificationSql);
            $notificationStmt->bind_param("sss",$recipient_id, $_SESSION['id'] ,  $post_id);
            $notificationStmt->execute();
            $notificationStmt->close();
            return array(
                'status' => 201,
                'message' => 'Message sent'
            );
        } else {
            return array(
                'status' => 400,
                'message' => 'Message not sent'
            );
        }
        
    }
    

    echo json_encode(sendMessage());
} else {
    http_response_code(405);
    echo json_encode([
        'status' => 405,
        'message' => 'Method Not Allowed'
    ]);
}
?>