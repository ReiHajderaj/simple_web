<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    function deleteNotification() {
        $data = json_decode(file_get_contents('php://input'), true);

        include_once "../auth/isAdmin.php";
        // return $data;
        $notification_id = $data['notification_id'];
        // return $notification_id;

        $sql = "DELETE FROM notifications WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $notification_id);
        $stmt->execute();

        return array(
            'status' => 201,
            'message' => 'Notification deleted successfully'
        );
    } 
    echo json_encode(deleteNotification());
} else {
    http_response_code(405);
    echo json_encode([
        'status' => 405,
        'message' => 'Method Not Allowed'
    ]);
}
?>
