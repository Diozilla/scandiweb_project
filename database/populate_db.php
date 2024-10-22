<?php
include '/xampp/htdocs/scandiweb/database/db_connect.php';

// Start transaction
$conn->begin_transaction();

try {
    // Read the JSON file
    $json = file_get_contents('/xampp/htdocs/scandiweb/data.json');

    // Check if the file was read successfully
    if ($json === false) {
        throw new Exception("Failed to read JSON file.");
    }

    // Decode JSON data
    $data = json_decode($json, true);

    // Check if json_decode was successful
    if ($data === null) {
        throw new Exception("Failed to decode JSON data: " . json_last_error_msg());
    }

    // Insert categories
    if (isset($data['data']['categories']) && is_array($data['data']['categories'])) {
        $stmt = $conn->prepare("INSERT INTO categories (name) VALUES (?)");
        foreach ($data['data']['categories'] as $category) {
            if (isset($category['name'])) {
                $stmt->bind_param("s", $category['name']);
                $stmt->execute();
            }
        }
        $stmt->close();
    } else {
        throw new Exception("Categories data is missing or not an array.");
    }

    // Insert products
    if (isset($data['data']['products']) && is_array($data['data']['products'])) {
        $stmt = $conn->prepare("INSERT IGNORE INTO products (id, name, inStock, description, category_id, brand) VALUES (?, ?, ?, ?, ?, ?)");
        foreach ($data['data']['products'] as $product) {
            // Lookup category_id
            $category_stmt = $conn->prepare("SELECT id FROM categories WHERE name = ?");
            $category_stmt->bind_param("s", $product['category']);
            $category_stmt->execute();
            $category_stmt->bind_result($category_id);
            $category_stmt->fetch();
            $category_stmt->close();

            $stmt->bind_param("ssisss", $product['id'], $product['name'], $product['inStock'], $product['description'], $category_id, $product['brand']);
            $stmt->execute();
        }
        $stmt->close();
    } else {
        throw new Exception("Products data is missing or not an array.");
    }

// Insert attributes and attribute items
// Insert attributes and attribute items
if (isset($data['data']['products']) && is_array($data['data']['products'])) {
    $attribute_stmt = $conn->prepare("INSERT INTO attributes (id, product_id, name, type) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE product_id = VALUES(product_id), name = VALUES(name), type = VALUES(type)");
    $item_stmt = $conn->prepare("INSERT INTO attribute_items (id, attribute_id, display_value, value) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE display_value = VALUES(display_value), value = VALUES(value)");

    foreach ($data['data']['products'] as $product) {
        foreach ($product['attributes'] as $attribute) {
            // Make the attribute ID unique by appending the product ID
            $unique_attribute_id = $attribute['id'] . '-' . $product['id'];

            $attribute_stmt->bind_param("ssss", $unique_attribute_id, $product['id'], $attribute['name'], $attribute['type']);
            $attribute_stmt->execute();

            // Insert attribute items
            foreach ($attribute['items'] as $item) {
                $item_stmt->bind_param("ssss", $item['id'], $unique_attribute_id, $item['displayValue'], $item['value']);
                $item_stmt->execute();
            }
        }
    }
    $attribute_stmt->close();
    $item_stmt->close();
} else {
    throw new Exception("Products data is missing or attributes are not an array.");
}


// Insert prices
if (isset($data['data']['products']) && is_array($data['data']['products'])) {
    $stmt = $conn->prepare("INSERT INTO prices (id, amount, currency_label, currency_symbol, product_id) VALUES (?, ?, ?, ?, ?)");
    foreach ($data['data']['products'] as $product) {
        foreach ($product['prices'] as $price) {
            // Generate a unique price ID (you may have a specific logic for this)
            $price_id = uniqid(); // or another method to generate a unique string ID

            $amount = $price['amount'];
            $currency_label = $price['currency']['label'];
            $currency_symbol = $price['currency']['symbol'];

            $stmt->bind_param("sssss", $price_id, $amount, $currency_label, $currency_symbol, $product['id']);
            $stmt->execute();
        }
    }
    $stmt->close();
} else {
    throw new Exception("Products data is missing or not an array.");
}


   // Insert gallery
if (isset($data['data']['products']) && is_array($data['data']['products'])) {
    $stmt = $conn->prepare("INSERT IGNORE INTO gallery (product_id, image_url) VALUES (?, ?)");
    
    foreach ($data['data']['products'] as $product) {
        foreach ($product['gallery'] as $image) {
            $stmt->bind_param("ss", $product['id'], $image);
            $stmt->execute();
        }
    }
    $stmt->close();
} else {
    throw new Exception("Products data is missing or not an array.");
}


    // Commit transaction
    $conn->commit();
    echo "Data inserted successfully!";
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    echo "Failed to insert data: " . $e->getMessage();
}

$conn->close();
?>
