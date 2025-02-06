<?php




function createPost() {
    include_once "../auth/isAdmin.php";

    // Check if the user is authorized (admin status)
    if ($flag['status'] === false) {
        return [
            'status' => 403, // Forbidden
            'error'  => true,
            'message'=> 'Unauthorized access'
        ];
    }

    // Initialize response array
    $response = [];

    // Retrieve and sanitize input data
    $title   = isset($_POST['title']) ? trim($_POST['title']) : '';
    $content = isset($_POST['content']) ? trim($_POST['content']) : '';

    // Validate required fields
    if (empty($title)) {
        return [
            'status' => 400, // Bad Request
            'error'  => true,
            'message'=> 'Title is required.'
        ];
    }

    // Initialize image_url as null
    $image_url = null;

    // Prepare SQL statement for inserting post without image_url
    $sql  = "INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        return [
            'status' => 500,
            'error'  => true,
            'message'=> 'Database prepare statement failed: ' . $conn->error
        ];
    }
    $stmt->bind_param("ssi", $title, $content, $_SESSION['id']);

    // Execute the statement
    if ($stmt->execute()) {
        // Get the inserted post ID
        $post_id = $stmt->insert_id;
        $response['status']  = 201; // Created
        $response['message'] = 'Post created successfully.';
    } else {
        $stmt->close();
        $conn->close();
        return [
            'status'  => 500,
            'error'   => true,
            'message' => 'Failed to create post. Please try again later.'
        ];
    }

    // Handle image upload if an image is provided
    if (isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
        // Check for upload errors
        if ($_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            return [
                'status' => 400,
                'error'  => true,
                'message'=> 'Error uploading the image.'
            ];
        }

        // Extract file details
        $fileTmpPath   = $_FILES['image']['tmp_name'];
        $fileName      = $_FILES['image']['name'];
        $fileSize      = $_FILES['image']['size'];
        $fileType      = $_FILES['image']['type'];
        $fileNameCmps  = explode(".", $fileName);
        $fileExtension = strtolower(end($fileNameCmps));

        // Define allowed file extensions and MIME types
        $allowedfileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        $allowedMimeTypes       = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        // Verify file extension
        if (!in_array($fileExtension, $allowedfileExtensions)) {
            return [
                'status' => 400,
                'error'  => true,
                'message'=> 'Unsupported file extension. Allowed types: jpg, jpeg, png, gif, webp.'
            ];
        }

        // Verify MIME type using FileInfo
        $finfo     = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType  = finfo_file($finfo, $fileTmpPath);
        finfo_close($finfo);

        if (!in_array($mimeType, $allowedMimeTypes)) {
            return [
                'status' => 400,
                'error'  => true,
                'message'=> 'Invalid image MIME type.'
            ];
        }

        // Optional: Limit file size (e.g., 5MB)
        $maxFileSize = 5 * 1024 * 1024; // 5MB
        if ($fileSize > $maxFileSize) {
            return [
                'status' => 400,
                'error'  => true,
                'message'=> 'Image size exceeds the 5MB limit.'
            ];
        }

        // Generate a unique file name starting with the post ID
        $newFileName = $post_id . '_' . md5(time() . $fileName) . '.' . $fileExtension;

        // Define the upload directory
        $uploadFileDir = __DIR__ . '/../../assets/images/posts/';

        // Create the directory if it doesn't exist
        if (!is_dir($uploadFileDir)) {
            if (!mkdir($uploadFileDir, 0755, true)) {
                return [
                    'status' => 500,
                    'error'  => true,
                    'message'=> 'Failed to create directories for image upload.'
                ];
            }
        }

        // Define the destination path
        $dest_path = $uploadFileDir . $newFileName;

        // Move the uploaded file to the destination directory
        if (move_uploaded_file($fileTmpPath, $dest_path)) {
            // Set the image URL relative to the web root
            $image_url = "/assets/images/posts/" . $newFileName;

            // Update the post with the image_url
            $update_sql = "UPDATE posts SET image_url = ? WHERE id = ?";
            $update_stmt = $conn->prepare($update_sql);
            if (!$update_stmt) {
                return [
                    'status' => 500,
                    'error'  => true,
                    'message'=> 'Database prepare statement failed: ' . $conn->error
                ];
            }
            $update_stmt->bind_param("si", $newFileName, $post_id);

            if ($update_stmt->execute()) {
                $response['image_url'] = $image_url;
            } else {
                return [
                    'status' => 500,
                    'error'  => true,
                    'message'=> 'Failed to update post with image URL.'
                ];
            }

            $update_stmt->close();
        } else {
            return [
                'status' => 500,
                'error'  => true,
                'message'=> 'There was an error moving the uploaded file.'
            ];
        }
    }

    // Close statement and connection
    $stmt->close();
    $conn->close();

    return $response;
}

// Handle the request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $result = createPost();
    // Set the appropriate HTTP response code
    http_response_code($result['status']);
    echo json_encode($result);
} else {
    // Method Not Allowed
    http_response_code(405);
    echo json_encode([
        'status'  => 405,
        'error'   => true,
        'message' => 'Method Not Allowed. Use POST.'
    ]);
}
?>