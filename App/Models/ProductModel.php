<?php

abstract class AbstractProduct
{
    protected $id;
    protected $name;
    protected $category_id;
    protected $description;
    protected $price;

    // Constructor to initialize common product properties
    public function __construct($id = null, $name = null, $category_id = null, $description = null, $price = null)
    {
        $this->id = $id;
        $this->name = $name;
        $this->category_id = $category_id;
        $this->description = $description;
        $this->price = $price;
    }

    // Getter methods
    public function getId()
    {
        return $this->id;
    }

    public function getName()
    {
        return $this->name;
    }

    public function getCategoryId()
    {
        return $this->category_id;
    }

    public function getDescription()
    {
        return $this->description;
    }

    public function getPrice()
    {
        return $this->price;
    }

    // Abstract methods for CRUD
    abstract public function save();
    abstract public function update();
    abstract public function delete();
    abstract public static function getById($id);
    abstract public static function getAll();
}

class Product extends AbstractProduct
{
    private static $conn;

    public static function setConnection(mysqli $connection)
    {
        self::$conn = $connection;
    }

    // Save product to the database
    public function save()
    {
        $stmt = self::$conn->prepare("INSERT INTO products (id, name, category_id, description, price) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param('ssssd', $this->id, $this->name, $this->category_id, $this->description, $this->price);
        $stmt->execute();
        $stmt->close();
    }

    // Update product details in the database
    public function update()
    {
        $stmt = self::$conn->prepare("UPDATE products SET name = ?, category_id = ?, description = ?, price = ? WHERE id = ?");
        $stmt->bind_param('sssds', $this->name, $this->category_id, $this->description, $this->price, $this->id);
        $stmt->execute();
        $stmt->close();
    }

    // Delete product from the database
    public function delete()
    {
        $stmt = self::$conn->prepare("DELETE FROM products WHERE id = ?");
        $stmt->bind_param('s', $this->id);
        $stmt->execute();
        $stmt->close();
    }

    // Fetch product by ID
    public static function getById($id)
    {
        $stmt = self::$conn->prepare("SELECT id, name, category_id, description, price FROM products WHERE id = ?");
        $stmt->bind_param('s', $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if ($result) {
            return new Product($result['id'], $result['name'], $result['category_id'], $result['description'], $result['price']);
        }
        return null;
    }

    // Fetch all products
    public static function getAll()
    {
        $result = self::$conn->query("SELECT id, name, category_id, description, price FROM products");
        return $result->fetch_all(MYSQLI_ASSOC);
    }
}
