<?php

abstract class AbstractPrice
{
    protected $id;
    protected $product_id;
    protected $currency;
    protected $amount;

    public function __construct($id = null, $product_id = null, $currency = null, $amount = null)
    {
        $this->id = $id;
        $this->product_id = $product_id;
        $this->currency = $currency;
        $this->amount = $amount;
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

    public function getCurrency()
    {
        return $this->currency;
    }

    public function getAmount()
    {
        return $this->amount;
    }

    // Abstract methods for CRUD
    abstract public function save();
    abstract public function update();
    abstract public function delete();
    abstract public static function getByProductId($product_id);
    abstract public static function getAll();
}

class Price extends AbstractPrice
{
    private static $conn;

    public static function setConnection(mysqli $connection)
    {
        self::$conn = $connection;
    }

    // Save or update the price in the database
    public function save()
    {
        $stmt = self::$conn->prepare("INSERT INTO prices (id, product_id, currency, amount) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE currency = VALUES(currency), amount = VALUES(amount)");
        $stmt->bind_param('ssss', $this->id, $this->product_id, $this->currency, $this->amount);
        $stmt->execute();
        $stmt->close();
    }

    // Update the price
    public function update()
    {
        // Updates are handled by the save method
        $this->save();
    }

    // Delete the price
    public function delete()
    {
        $stmt = self::$conn->prepare("DELETE FROM prices WHERE id = ?");
        $stmt->bind_param('s', $this->id);
        $stmt->execute();
        $stmt->close();
    }

    // Fetch prices by product ID
    public static function getByProductId($product_id)
    {
        $stmt = self::$conn->prepare("SELECT id, currency, amount FROM prices WHERE product_id = ?");
        $stmt->bind_param('s', $product_id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        $prices = [];
        foreach ($result as $price_data) {
            $prices[] = new Price($price_data['id'], $product_id, $price_data['currency'], $price_data['amount']);
        }

        return $prices;
    }

    // Fetch all prices
    public static function getAll()
    {
        $result = self::$conn->query("SELECT id, product_id, currency, amount FROM prices");
        $prices = [];

        while ($row = $result->fetch_assoc()) {
            $prices[] = new Price($row['id'], $row['product_id'], $row['currency'], $row['amount']);
        }

        return $prices;
    }
}
