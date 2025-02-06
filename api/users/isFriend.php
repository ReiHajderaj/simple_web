<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    function isFriend() {
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
        $friend_id = $data->friend_id;

        // Fetch the list of friend IDs
        $friendsSql = "SELECT * FROM friends WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)";
        $friendsStmt = $conn->prepare($friendsSql);
        $friendsStmt->bind_param("ssss", $id, $friend_id, $friend_id, $id);
        $friendsStmt->execute();
        $friendsResult = $friendsStmt->get_result();
        $friendIds = $friendsResult->fetch_all(MYSQLI_ASSOC);

        // Extract friend IDs into an array
        if($friendIds){
            return array(
                'status' => 201,
                'message' => 'Friend'
            );
        } else {
            return array(
                'status' => 401,
                'message' => 'Not Friend'
            );
        }
    }

    echo json_encode(isFriend());
} else {
    http_response_code(405);
    echo json_encode([
        'status' => 405,
        'message' => 'Method Not Allowed'
    ]);
}
?>