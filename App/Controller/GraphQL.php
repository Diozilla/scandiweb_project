<?php

namespace App\Controller;

use GraphQL\GraphQL as GraphQLBase;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use GraphQL\Type\Schema;
use GraphQL\Type\SchemaConfig;
use mysqli;
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

class GraphQL
{
    static private $conn;

    // Method to set database connection
    public static function setConnection(mysqli $connection)
    {
        self::$conn = $connection;
    }

    static public function handle()
    {
        try {
            // Define Attribute Type
            $attributeType = new ObjectType([
                'name' => 'Attribute',
                'fields' => [
                    'id' => Type::string(),
                    'name' => Type::string(),
                    'type' => Type::string(),
                    'items' => [
                        'type' => Type::listOf(new ObjectType([
                            'name' => 'AttributeItem',
                            'fields' => [
                                'id' => Type::string(),
                                'display_value' => Type::string(),
                                'value' => Type::string(),
                            ],
                        ])),
                        'resolve' => function ($attribute) {
                            $query = "SELECT id, display_value, value FROM attribute_items WHERE attribute_id = '{$attribute['id']}'";
                            $result = self::$conn->query($query);

                            if (!$result) {
                                error_log('Query failed: ' . self::$conn->error);
                                return []; // Return an empty array on error
                            }

                            return $result->fetch_all(MYSQLI_ASSOC);
                        },
                    ],
                ],
            ]);

            // Define Price Type
            $priceType = new ObjectType([
                'name' => 'Price',
                'fields' => [
                    'amount' => Type::float(),
                    'label' => Type::string(),
                    'symbol' => Type::string(),
                ],
            ]);

            // Define Gallery Type
            $galleryType = new ObjectType([
                'name' => 'Gallery',
                'fields' => [
                    'imageUrl' => Type::string(),
                ],
            ]);

            // Define Product Type
            $productType = new ObjectType([
                'name' => 'Product',
                'fields' => [
                    'id' => Type::string(),
                    'name' => Type::string(),
                    'inStock' => Type::boolean(),
                    'description' => Type::string(),
                    'category_id' => Type::int(),
                    'brand' => Type::string(),
                    'attributes' => [
                        'type' => Type::listOf($attributeType),
                        'resolve' => function ($product) {
                            // Fetch attributes based on product ID
                            $query = "SELECT a.id, a.name, a.type, ai.id AS item_id, ai.display_value, ai.value
                                      FROM attributes a
                                      LEFT JOIN attribute_items ai ON a.id = ai.attribute_id
                                      WHERE a.product_id = '{$product['id']}'";
                            $result = self::$conn->query($query);

                            if (!$result) {
                                error_log('Query failed: ' . self::$conn->error);
                                return []; // Return an empty array on error
                            }

                            $attributes = [];
                            while ($row = $result->fetch_assoc()) {
                                if (!isset($attributes[$row['id']])) {
                                    $attributes[$row['id']] = [
                                        'id' => $row['id'],
                                        'name' => $row['name'],
                                        'type' => $row['type'],
                                        'items' => [],
                                    ];
                                }
                                if ($row['item_id']) {
                                    $attributes[$row['id']]['items'][] = [
                                        'id' => $row['item_id'],
                                        'display_value' => $row['display_value'],
                                        'value' => $row['value'],
                                    ];
                                }
                            }

                            return array_values($attributes);
                        },
                    ],
                    'prices' => [
                        'type' => Type::listOf($priceType),
                        'resolve' => function ($product) {
                            $query = "SELECT amount, currency_label AS label, currency_symbol AS symbol FROM prices WHERE product_id = '{$product['id']}'";
                            $result = self::$conn->query($query);

                            if (!$result) {
                                error_log('Query failed: ' . self::$conn->error);
                                return [];
                            }

                            return $result->fetch_all(MYSQLI_ASSOC);
                        },
                    ],
                    'gallery' => [
                        'type' => Type::listOf(Type::string()),
                        'resolve' => function ($product) {
                            $query = "SELECT image_url FROM gallery WHERE product_id = '{$product['id']}'";
                            $result = self::$conn->query($query);

                            if (!$result) {
                                error_log('Query failed: ' . self::$conn->error);
                                return [];
                            }

                            $gallery = [];
                            while ($row = $result->fetch_assoc()) {
                                $gallery[] = $row['image_url'];
                            }

                            return $gallery;
                        },
                    ],
                ],
            ]);

            // Define Query Type
            $queryType = new ObjectType([
                'name' => 'Query',
                'fields' => [
                    'categories' => [
                        'type' => Type::listOf(new ObjectType([
                            'name' => 'Category',
                            'fields' => [
                                'id' => Type::int(),
                                'name' => Type::string(),
                            ],
                        ])),
                        'resolve' => function () {
                            $result = self::$conn->query("SELECT id, name FROM categories");
                            return $result->fetch_all(MYSQLI_ASSOC);
                        },
                    ],
                    'products' => [
                        'type' => Type::listOf($productType),
                        'args' => [
                            'category' => ['type' => Type::int()],
                            'limit' => ['type' => Type::int()], // Pagination argument
                            'offset' => ['type' => Type::int()], // Pagination argument
                        ],
                        'resolve' => function ($root, $args) {
                            // Start building the query
                            $query = "SELECT id, name, inStock, description, category_id, brand FROM products";
                            
                            // If a category is provided, filter by it
                            if (isset($args['category'])) {
                                $categoryId = self::$conn->real_escape_string($args['category']);
                                $query .= " WHERE category_id = '$categoryId'";
                            }

                            // Apply pagination if provided
                            if (isset($args['limit'])) {
                                $limit = (int)$args['limit'];
                                $query .= " LIMIT $limit";
                            }
                            if (isset($args['offset'])) {
                                $offset = (int)$args['offset'];
                                $query .= " OFFSET $offset";
                            }

                            $result = self::$conn->query($query);
                            return $result->fetch_all(MYSQLI_ASSOC);
                        },
                    ],
                    // Fetch product by ID
                    'product' => [
                        'type' => $productType,
                        'args' => [
                            'id' => ['type' => Type::string()],
                        ],
                        'resolve' => function ($root, $args) {
                            // Validate input
                            if (empty($args['id'])) {
                                throw new \Exception("Product ID must be provided.");
                            }

                            $productId = self::$conn->real_escape_string($args['id']);
                            $query = "SELECT id, name, inStock, description, category_id, brand FROM products WHERE id = '$productId'";
                            $result = self::$conn->query($query);

                            if (!$result || $result->num_rows === 0) {
                                return null; // Return null if no product found
                            }

                            // Fetch the product details
                            $product = $result->fetch_assoc();

                            // Fetch the attributes
                            $attributesQuery = "SELECT a.id, a.name, a.type, ai.id AS item_id, ai.display_value, ai.value
                                                FROM attributes a
                                                LEFT JOIN attribute_items ai ON a.id = ai.attribute_id
                                                WHERE a.product_id = '{$product['id']}'";
                            $attributesResult = self::$conn->query($attributesQuery);

                            // Process attributes
                            $attributes = [];
                            while ($row = $attributesResult->fetch_assoc()) {
                                if (!isset($attributes[$row['id']])) {
                                    $attributes[$row['id']] = [
                                        'id' => $row['id'],
                                        'name' => $row['name'],
                                        'type' => $row['type'],
                                        'items' => [],
                                    ];
                                }
                                if ($row['item_id']) {
                                    $attributes[$row['id']]['items'][] = [
                                        'id' => $row['item_id'],
                                        'display_value' => $row['display_value'],
                                        'value' => $row['value'],
                                    ];
                                }
                            }

                            $product['attributes'] = array_values($attributes); // Add attributes to product
                            return $product;
                        },
                    ],
                ],
            ]);

            // Define Mutation Type
            $mutationType = new ObjectType([
                'name' => 'Mutation',
                'fields' => [
                    'createOrder' => [
                        'type' => Type::string(),
                        'args' => [
                            'productId' => ['type' => Type::string()],
                            'quantity' => ['type' => Type::int()],
                        ],
                        'resolve' => function ($rootValue, $args) {
                            // Validate input
                            if (empty($args['productId']) || $args['quantity'] <= 0) {
                                throw new \Exception("Invalid product ID or quantity.");
                            }

                            // Process the order
                            $productId = self::$conn->real_escape_string($args['productId']);
                            $quantity = (int)$args['quantity'];

                            // Create the order in the database (simplified example)
                            $insertQuery = "INSERT INTO orders (product_id, quantity) VALUES ('$productId', $quantity)";
                            if (!self::$conn->query($insertQuery)) {
                                error_log('Order creation failed: ' . self::$conn->error);
                                throw new \Exception("Failed to create order.");
                            }

                            return "Order created successfully.";
                        },
                    ],
                    // Other mutations like createCategory, createProduct, etc.
                ],
            ]);

            // Define schema
            $schema = new Schema([
                'query' => $queryType,
                'mutation' => $mutationType,
            ]);

            // Handle the GraphQL request
            $input = json_decode(file_get_contents('php://input'), true);
            $result = GraphQLBase::executeQuery($schema, $input['query'], null, null, $input['variables']);
            echo json_encode($result->toArray());

        } catch (\Exception $e) {
            // Standardized error response
            echo json_encode([
                'errors' => [
                    [
                        'message' => $e->getMessage(),
                    ],
                ],
            ]);
            error_log($e->getMessage()); // Log the error for debugging
        }
    }
}
