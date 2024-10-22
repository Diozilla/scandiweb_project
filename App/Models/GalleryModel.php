<?php

abstract class AbstractGallery
{
    protected $id;
    protected $product_id;
    protected $images = [];

    // Constructor to initialize common gallery properties
    public function __construct($id = null, $product_id = null, $images = [])
    {
        $this->id = $id;
        $this->product_id = $product_id;
        $this->images = $images;
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

    public function getImages()
    {
        return $this->images;
    }

    // Abstract methods for CRUD
    abstract public function save();
    abstract public function update();
    abstract public function delete();
    abstract public static function getByProductId($product_id);
    abstract public static function getAll();
}

class Gallery extends AbstractGallery
{
    private static $conn;

    public static function setConnection(mysqli $connection)
    {
        self::$conn = $connection;
    }

    // Save gallery to the database
    public function save()
    {
        // Delete old images first to replace with new
        $delete_stmt = self::$conn->prepare("DELETE FROM galleries WHERE product_id = ?");
        $delete_stmt->bind_param('s', $this->product_id);
        $delete_stmt->execute();
        $delete_stmt->close();

        // Insert new images
        $insert_stmt = self::$conn->prepare("INSERT INTO galleries (id, product_id, image) VALUES (?, ?, ?)");
        foreach ($this->images as $image) {
            $insert_stmt->bind_param('sss', $this->id, $this->product_id, $image);
            $insert_stmt->execute();
        }
        $insert_stmt->close();
    }

    // Update gallery
    public function update()
    {
        // The update will be handled by deleting old entries and inserting new ones
        $this->save();
    }

    // Delete gallery
    public function delete()
    {
        $stmt = self::$conn->prepare("DELETE FROM galleries WHERE product_id = ?");
        $stmt->bind_param('s', $this->product_id);
        $stmt->execute();
        $stmt->close();
    }

    // Fetch gallery by product ID
    public static function getByProductId($product_id)
    {
        $stmt = self::$conn->prepare("SELECT id, product_id, image FROM galleries WHERE product_id = ?");
        $stmt->bind_param('s', $product_id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        if ($result) {
            $images = array_column($result, 'image');
            return new Gallery($result[0]['id'], $result[0]['product_id'], $images);
        }
        return null;
    }

    // Fetch all galleries
    public static function getAll()
    {
        $result = self::$conn->query("SELECT id, product_id, image FROM galleries");
        $galleries = [];

        while ($row = $result->fetch_assoc()) {
            $product_id = $row['product_id'];
            if (!isset($galleries[$product_id])) {
                $galleries[$product_id] = ['id' => $row['id'], 'product_id' => $product_id, 'images' => []];
            }
            $galleries[$product_id]['images'][] = $row['image'];
        }

        return array_values($galleries);
    }
}
