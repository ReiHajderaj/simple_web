
<?php
include_once "../database.php";


// Check if user is logged in by verifying session
$flag = array();
if (isset($_SESSION['id'])) {
    $sql = "SELECT * FROM users WHERE id = ? AND username = ? AND email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $_SESSION['id'], $_SESSION['user'], $_SESSION['email']);
    $stmt->execute();
    $result = $stmt->get_result();
    // echo json_encode($result);
    if (mysqli_num_rows($result) > 0) {
        $flag['status'] = true;
        
    } else {
        $flag['status'] = false;
        
    }
} else {
    $flag['status'] = false;
    
}


?>

