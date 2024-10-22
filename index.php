<?php

require_once 'vendor/autoload.php'; // Adjust the path as necessary
use App\Controller\GraphQL;

// Database connection
$servername = "localhost";
$username = "root";
$password = ""; // Leave blank if there's no password
$dbname = "scandiweb_db"; // Use the new database name

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set the database connection in the GraphQL class
GraphQL::setConnection($conn);

// Handle GraphQL requests
echo GraphQL::handle();

$conn->close();
