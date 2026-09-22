const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const db = require("./db");

const app = express();

const PORT = 5000;


// -----------------------------
// Basic middleware
// -----------------------------

app.use(cors());

app.use(express.json());


// -----------------------------
// Serve frontend files
// -----------------------------

app.use(express.static("public"));


// -----------------------------
// Serve uploaded fish images
// -----------------------------

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);


// -----------------------------
// Image upload configuration
// -----------------------------

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(
            null,
            "uploads/fish-images"
        );

    },

    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() +
            "-" +
            file.originalname.replace(
                /\s+/g,
                "-"
            );

        cb(
            null,
            uniqueName
        );

    }

});


const upload =
    multer({
        storage: storage
    });


// -----------------------------
// Test API
// -----------------------------

app.get(
    "/api/test",
    (req, res) => {

        res.json({

            success: true,

            message:
                "Smart Fish Market backend is working"

        });

    }
);


// -----------------------------
// Fish image upload API
// -----------------------------

app.post(
    "/api/upload-image",
    upload.single("image"),
    (req, res) => {

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message:
                    "No image was uploaded"

            });

        }


        res.json({

            success: true,

            message:
                "Fish image uploaded successfully",

            imageUrl:
                `/uploads/fish-images/${req.file.filename}`

        });

    }
);


// -----------------------------
// Get all fish from MySQL
// -----------------------------

app.get(
    "/api/fish",
    async (req, res) => {

        try {

            const [rows] =
                await db.query(
                    "SELECT * FROM fish ORDER BY id DESC"
                );


            res.json({

                success: true,

                fish: rows

            });


        } catch (error) {

            console.error(
                "Error fetching fish:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch fish"

            });

        }

    }
);


// -----------------------------
// Add new fish to MySQL
// -----------------------------

app.post(
    "/api/fish",
    async (req, res) => {

        try {

            const {
                name,
                price,
                quantity,
                availability,
                image
            } = req.body;


            // Basic validation

            if (
                !name ||
                price === undefined
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Fish name and price are required"

                });

            }


            const [result] =
                await db.query(

                    `INSERT INTO fish
                    (name, price, quantity, availability, image)
                    VALUES (?, ?, ?, ?, ?)`,

                    [
                        name,

                        Number(price),

                        Number(quantity) || 0,

                        availability ||
                            "Available",

                        image || null
                    ]

                );


            res.status(201).json({

                success: true,

                message:
                    "Fish added successfully",

                fishId:
                    result.insertId

            });


        } catch (error) {

            console.error(
                "Error adding fish:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to add fish"

            });

        }

    }
);


// -----------------------------
// Start server
// -----------------------------

app.listen(
    PORT,
    () => {

        console.log(
            `Smart Fish Market running at http://localhost:${PORT}`
        );

    }
);
/* =====================================================
   CREATE ORDER
===================================================== */

app.post("/api/orders", async (req, res) => {

    try {

        const {
            customerName,
            phone,
            address,
            paymentMethod,
            items
        } = req.body;

        if (
            !customerName ||
            !phone ||
            !address ||
            !paymentMethod ||
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Complete customer and order details are required"
            });
        }

        const orderGroup =
            "ORD-" +
            Date.now();

        for (const item of items) {

            const quantity =
                Number(item.quantity) || 0;

            const price =
                Number(item.price) || 0;

            const total =
                price * quantity;

            await db.query(
                `INSERT INTO orders
                (
                    order_group,
                    customer_name,
                    customer_phone,
                    customer_address,
                    fish_name,
                    quantity,
                    price,
                    total,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    orderGroup,
                    customerName,
                    phone,
                    address,
                    item.name,
                    quantity,
                    price,
                    total,
                    "Pending"
                ]
            );
        }

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            orderGroup: orderGroup
        });

    } catch (error) {

        console.error(
            "Error creating order:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to place order"
        });

    }

});


/* =====================================================
   GET ALL ORDERS
===================================================== */

app.get("/api/orders", async (req, res) => {

    try {

        const [rows] =
            await db.query(
                `SELECT *
                 FROM orders
                 ORDER BY created_at DESC`
            );

        res.json({
            success: true,
            orders: rows
        });

    } catch (error) {

        console.error(
            "Error fetching orders:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch orders"
        });

    }

});