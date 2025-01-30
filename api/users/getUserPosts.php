<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    function getHomeFeed() {
        include_once "../auth/isAdmin.php";

        if ($flag['status'] == false) {
            return array(
                'status' => 403,
                'error' => true,
                'message' => 'Unauthorized access'
            );
        }

        $id = $_SESSION['id'];

        $sql = "SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $id);
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

        

        return array(
            'status' => 201,
            'posts' => 'hello'
        );
    }

    echo json_encode(getHomeFeed());
} else {
    http_response_code(405);
    echo json_encode([
        'status' => 405,
        'message' => 'Method Not Allowed'
    ]);
}
?>