<?php 

$servername = "localhost";
$username = "root";
$password = ""; // Leave blank if there's no password
$dbname = "scandiweb_db"; // Updated database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection and handle errors
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} else {
    echo "Connected successfully to the database.";
}
?>
