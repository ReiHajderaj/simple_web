<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    function updateSettings() {
        include_once "../auth/isAdmin.php";
    
        if ($flag['status'] == false) {
            return array(
                'status' => 401,
                'error' => true,
                'message' => 'Unauthorized access'
            );
        }

        $username = filter_var($_POST['username'], FILTER_SANITIZE_STRING);
        $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
        $bio = filter_var($_POST['bio'], FILTER_SANITIZE_STRING);
        
        // Validate input lengths
        if (strlen($username) < 6) {
            return array(
                'status' => 400,
                'message' => 'Username must be at least 6 characters long'
            );
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return array(
                'status' => 400,
                'message' => 'Invalid email format'
            );
        }

        try {
            // Handle profile picture upload if provided
            
            if (isset($_FILES['picture']) && $_FILES['picture']['error'] === UPLOAD_ERR_OK) {
                $allowed = array('jpg', 'jpeg', 'png', 'gif');
                $filename = $_FILES['picture']['name'];
                $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
                
                if (!in_array($ext, $allowed)) {
                    return array(
                        'status' => 400,
                        'message' => 'Invalid file type. Only jpg, jpeg, png, and gif are allowed.'
                    );
                }

                // Generate unique filename with user ID prefix
                $profile_image = $_SESSION['id'] . '-' . uniqid() . '.' . $ext;
                $upload_path = $_SERVER['DOCUMENT_ROOT'] . '/simple_web/assets/images/avatars/' . $profile_image;
                
                // Remove previous avatar images with the same user ID prefix
                $avatar_directory = $_SERVER['DOCUMENT_ROOT'] . '/simple_web/assets/images/avatars/';
                $files = glob($avatar_directory . $_SESSION['id'] . '-*');
                foreach ($files as $file) {
                    if (is_file($file) && $file !== $upload_path) {
                        unlink($file);
                    }
                }

                if (!move_uploaded_file($_FILES['picture']['tmp_name'], $upload_path)) {
                    return array(
                        'status' => 500,
                        'message' => 'Failed to upload profile picture'
                    );
                }
            }

            // Update user information in database
            $sql = "UPDATE users SET username = ?, email = ?, bio = ?";
            $params = array($username, $email, $bio);
            $types = "sss";

            if (isset($_FILES['picture']) && $_FILES['picture']['error'] === UPLOAD_ERR_OK) {
                $sql .= ", profile_image_url = ?";
                $params[] = $profile_image;
                $types .= "s";
            }

            $sql .= " WHERE id = ?";
            $params[] = $_SESSION['id'];
            $types .= "i";

            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
            
            if ($stmt->execute()) {
                $_SESSION['user'] = $username;
                $_SESSION['email'] = $email;
                if(isset($profile_image)){
                
                return array(
                        'status' => 201,
                        'message' => 'Settings updated successfully',
                        'image' => $profile_image,
                        'username' => $username,
                        
                    );
                } else {
                    return array(
                        'status' => 201,
                        'message' => 'Settings updated successfully',
                        'username' => $username,
                    );
                }
            } else {
                return array(
                    'status' => 500,
                    'message' => 'Failed to update settings'
                );
            }
        } catch (Exception $e) {
            return array(
                'status' => 500,
                'message' => 'Error: ' . $e->getMessage()
            );
        } finally {
            if (isset($stmt)) {
                $stmt->close();
            }
            $conn->close();
        }
    }

    echo json_encode(updateSettings());
} else {
    http_response_code(405);
    echo json_encode([
        'status' => 405,
        'message' => 'Method not allowed'
    ]);
}
?>
