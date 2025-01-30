<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    function getDashboardFeed() {
        include_once "../auth/isAdmin.php";

        if ($flag['status'] == false) {
            return array(
                'status' => 403,
                'error' => true,
                'message' => 'Unauthorized access'
            );
        }

        $id = $_SESSION['id'];

        // Fetch the list of friend IDs
        $friendsSql = "SELECT CASE WHEN user_id_1 = ? THEN user_id_2 WHEN user_id_2 = ? THEN user_id_1 END AS friend_id FROM friends WHERE (user_id_1 = ? OR user_id_2 = ?) AND created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)";
        $friendsStmt = $conn->prepare($friendsSql);
        $friendsStmt->bind_param("ssss", $id, $id, $id, $id);
        $friendsStmt->execute();
        $friendsResult = $friendsStmt->get_result();
        $friendIds = $friendsResult->fetch_all(MYSQLI_ASSOC);

        // Extract friend IDs into an array
        $ids = array_map(function($row) { return $row['friend_id']; }, $friendIds);
        // Include the user's own ID
        $ids[] = $id;

        // Create a string of placeholders for the IN clause
        $placeholders = implode(',', array_fill(0, count($ids), '?'));

        $sql = "SELECT * FROM posts WHERE user_id IN ($placeholders) ORDER BY created_at DESC";
        $stmt = $conn->prepare($sql);

        // Dynamically bind parameters
        $types = str_repeat("s", count($ids));
        $stmt->bind_param($types, ...$ids);
        $stmt->execute();
        $result = $stmt->get_result();
        $posts = $result->fetch_all(MYSQLI_ASSOC);

        if($posts){
            return array(
                'status' => 201,
                'posts' => $posts
            );
        } else {
            return array(
                'status' => 401,
                'message' => 'No posts found'
            );
        }
    }

    echo json_encode(getDashboardFeed());
} else {
    http_response_code(405);
    echo json_encode([
        'status' => 405,
        'message' => 'Method Not Allowed'
    ]);
}
?>