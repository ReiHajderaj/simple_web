<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    function getOtherUserPosts() {
        include_once "../auth/isAdmin.php";

        if ($flag['status'] == false) {
            return array(
                'status' => 403,
                'error' => true,
                'message' => 'Unauthorized access'
            );
        }

        $data = json_decode(file_get_contents('php://input'));

        $id = $data->id;

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

    echo json_encode(getOtherUserPosts());
} else {
    http_response_code(405);
    echo json_encode([
        'status' => 405,
        'message' => 'Method Not Allowed'
    ]);
}
?>