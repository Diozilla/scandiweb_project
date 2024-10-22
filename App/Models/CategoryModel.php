<?php

abstract class AbstractCategory
{
    protected $id;
    protected $name;

    // Getter methods
    public function getId()
    {
        return $this->id;
    }

    public function getName()
    {
        return $this->name;
    }

    // Abstract method to save category
    abstract public function save();

    // Abstract method to update category
    abstract public function update();

    // Abstract method to delete category
    abstract public function delete();

    // Abstract method to get category by ID
    abstract public static function getById($id);
}

class Category extends AbstractCategory
{
    private static $conn;

    public static function setConnection(mysqli $connection)
    {
        self::$conn = $connection;
    }

    public function __construct($id = null, $name = null)
    {
        $this->id = $id;
        $this->name = $name;
    }

    public function save()
    {
        $stmt = self::$conn->prepare("INSERT INTO categories (id, name) VALUES (?, ?)");
        $stmt->bind_param('is', $this->id, $this->name);
        $stmt->execute();
        $stmt->close();
    }

    public function update()
    {
        $stmt = self::$conn->prepare("UPDATE categories SET name = ? WHERE id = ?");
        $stmt->bind_param('si', $this->name, $this->id);
        $stmt->execute();
        $stmt->close();
    }

    public function delete()
    {
        $stmt = self::$conn->prepare("DELETE FROM categories WHERE id = ?");
        $stmt->bind_param('i', $this->id);
        $stmt->execute();
        $stmt->close();
    }

    public static function getById($id)
    {
        $stmt = self::$conn->prepare("SELECT id, name FROM categories WHERE id = ?");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if ($result) {
            return new Category($result['id'], $result['name']);
        }
        return null;
    }

    // Fetch all categories
    public static function getAll()
    {
        $result = self::$conn->query("SELECT id, name FROM categories");
        return $result->fetch_all(MYSQLI_ASSOC);
    }
}
