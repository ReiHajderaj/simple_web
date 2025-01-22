<?php
$dbusername = "root"; 
$dbserver = "localhost";
$dbpassword = "";
$dbname = "socialmedia";

if (!isset($_SESSION)) {
    session_start();
}
    // Create connection
    $conn = mysqli_connect($dbserver, $dbusername, $dbpassword, $dbname);



// Check connection
if (!$conn) {
    echo json_encode([
        'status' => 500,
        'message' => 'Connection failed'
    ]);
}
