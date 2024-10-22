<?php

abstract class AbstractAttribute
{
    protected $id;
    protected $product_id;
    protected $name;
    protected $type;
    protected $items = [];

    public function __construct($id = null, $product_id = null, $name = null, $type = null, $items = [])
    {
        $this->id = $id;
        $this->product_id = $product_id;
        $this->name = $name;
        $this->type = $type;
        $this->items = $items;
    }

    // Getter methods
    public function getId()
    {
        return $this->id;
    }

    public function getProductId()
    {
        return $this->product_id;
    }

    public function getName()
    {
        return $this->name;
    }

    public function getType()
    {
        return $this->type;
    }

    public function getItems()
    {
        return $this->items;
    }

    // Abstract methods for CRUD
    abstract public function save();
    abstract public function update();
    abstract public function delete();
    abstract public static function getByProductId($product_id);
    abstract public static function getAll();
}

class Attribute extends AbstractAttribute
{
    private static $conn;

    public static function setConnection(mysqli $connection)
    {
        self::$conn = $connection;
    }

    // Save attribute and its items to the database
    public function save()
    {
        // Insert or update the attribute
        $attribute_stmt = self::$conn->prepare("INSERT INTO attributes (id, product_id, name, type) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), type = VALUES(type)");
        $attribute_stmt->bind_param('ssss', $this->id, $this->product_id, $this->name, $this->type);
        $attribute_stmt->execute();
        $attribute_stmt->close();

        // Insert attribute items (delete old ones first)
        $delete_items_stmt = self::$conn->prepare("DELETE FROM attribute_items WHERE attribute_id = ?");
        $delete_items_stmt->bind_param('s', $this->id);
        $delete_items_stmt->execute();
        $delete_items_stmt->close();

        // Insert new items
        $item_stmt = self::$conn->prepare("INSERT INTO attribute_items (id, attribute_id, display_value, value) VALUES (?, ?, ?, ?)");
        foreach ($this->items as $item) {
            $item_stmt->bind_param('ssss', $item['id'], $this->id, $item['display_value'], $item['value']);
            $item_stmt->execute();
        }
        $item_stmt->close();
    }

    // Update attribute and its items
    public function update()
    {
        // Updates are handled by the save method
        $this->save();
    }

    // Delete attribute and its items
    public function delete()
    {
        // Delete items first
        $delete_items_stmt = self::$conn->prepare("DELETE FROM attribute_items WHERE attribute_id = ?");
        $delete_items_stmt->bind_param('s', $this->id);
        $delete_items_stmt->execute();
        $delete_items_stmt->close();

        // Delete attribute
        $delete_attribute_stmt = self::$conn->prepare("DELETE FROM attributes WHERE id = ?");
        $delete_attribute_stmt->bind_param('s', $this->id);
        $delete_attribute_stmt->execute();
        $delete_attribute_stmt->close();
    }

    // Fetch attributes by product ID
    public static function getByProductId($product_id)
    {
        $attribute_stmt = self::$conn->prepare("SELECT id, name, type FROM attributes WHERE product_id = ?");
        $attribute_stmt->bind_param('s', $product_id);
        $attribute_stmt->execute();
        $attributes_result = $attribute_stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $attribute_stmt->close();

        $attributes = [];
        foreach ($attributes_result as $attribute_data) {
            $attribute_id = $attribute_data['id'];

            // Fetch attribute items for this attribute
            $item_stmt = self::$conn->prepare("SELECT id, display_value, value FROM attribute_items WHERE attribute_id = ?");
            $item_stmt->bind_param('s', $attribute_id);
            $item_stmt->execute();
            $items_result = $item_stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            $item_stmt->close();

            $attributes[] = new Attribute(
                $attribute_data['id'],
                $product_id,
                $attribute_data['name'],
                $attribute_data['type'],
                $items_result
            );
        }

        return $attributes;
    }

    // Fetch all attributes
    public static function getAll()
    {
        $result = self::$conn->query("SELECT id, product_id, name, type FROM attributes");
        $attributes = [];

        while ($row = $result->fetch_assoc()) {
            $attribute_id = $row['id'];

            // Fetch attribute items for this attribute
            $item_result = self::$conn->query("SELECT id, display_value, value FROM attribute_items WHERE attribute_id = '$attribute_id'");
            $items = $item_result->fetch_all(MYSQLI_ASSOC);

            $attributes[] = new Attribute($row['id'], $row['product_id'], $row['name'], $row['type'], $items);
        }

        return $attributes;
    }
}
