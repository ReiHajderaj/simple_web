<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    function deleteNotification() {
        $data = json_decode(file_get_contents('php://input'), true);

        include_once "../auth/isAdmin.php";
        // return $data;
        $friend_id = $data['friendId'];
        $id = $_SESSION['id'];

        $sql = "DELETE FROM friends WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssss", $friend_id, $id, $id, $friend_id);
        $stmt->execute();

        return array(
            'status' => 201,
            'message' => 'Friend removed successfully'
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
