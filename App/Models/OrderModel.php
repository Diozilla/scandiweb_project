<?php

abstract class AbstractOrder
{
    protected $id;
    protected $customer_id;
    protected $status;
    protected $total_amount;

    public function __construct($id = null, $customer_id = null, $status = null, $total_amount = null)
    {
        $this->id = $id;
        $this->customer_id = $customer_id;
        $this->status = $status;
        $this->total_amount = $total_amount;
    }

    // Getter methods
    public function getId()
    {
        return $this->id;
    }

    public function getCustomerId()
    {
        return $this->customer_id;
    }

    public function getStatus()
    {
        return $this->status;
    }

    public function getTotalAmount()
    {
        return $this->total_amount;
    }

    // Abstract methods for CRUD
    abstract public function save();
    abstract public function update();
    abstract public function delete();
    abstract public static function getById($id);
    abstract public static function getAll();
}

class Order extends AbstractOrder
{
    private static $conn;

    public static function setConnection(mysqli $connection)
    {
        self::$conn = $connection;
    }

    // Save or update the order in the database
    public function save()
    {
        $stmt = self::$conn->prepare("INSERT INTO orders (id, customer_id, status, total_amount) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status), total_amount = VALUES(total_amount)");
        $stmt->bind_param('ssss', $this->id, $this->customer_id, $this->status, $this->total_amount);
        $stmt->execute();
        $stmt->close();
    }

    // Update the order
    public function update()
    {
        // Updates are handled by the save method
        $this->save();
    }

    // Delete the order
    public function delete()
    {
        $stmt = self::$conn->prepare("DELETE FROM orders WHERE id = ?");
        $stmt->bind_param('s', $this->id);
        $stmt->execute();
        $stmt->close();
    }

    // Fetch an order by ID
    public static function getById($id)
    {
        $stmt = self::$conn->prepare("SELECT id, customer_id, status, total_amount FROM orders WHERE id = ?");
        $stmt->bind_param('s', $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if ($result) {
            return new Order($result['id'], $result['customer_id'], $result['status'], $result['total_amount']);
        }

        return null;
    }

    // Fetch all orders
    public static function getAll()
    {
        $result = self::$conn->query("SELECT id, customer_id, status, total_amount FROM orders");
        $orders = [];

        while ($row = $result->fetch_assoc()) {
            $orders[] = new Order($row['id'], $row['customer_id'], $row['status'], $row['total_amount']);
        }

        return $orders;
    }
}
