<?php
$servername = "127.0.0.1";
$username = "root";
$password = "";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully\n";

// Attempt to create database
$sql = "CREATE DATABASE IF NOT EXISTS loyalty_system";
if ($conn->query($sql) === TRUE) {
    echo "Database 'loyalty_system' created or already exists";
} else {
    echo "Error creating database: " . $conn->error;
}

$conn->close();
