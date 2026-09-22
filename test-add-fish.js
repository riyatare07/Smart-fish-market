const db = require("./db");

async function addTestFish() {

    try {

        const [result] = await db.query(
            `INSERT INTO fish
            (name, price, quantity, availability, image)
            VALUES (?, ?, ?, ?, ?)`,
            [
                "Test Surmai",
                500,
                10,
                "Available",
                null
            ]
        );

        console.log("✅ Fish added successfully!");
        console.log("New Fish ID:", result.insertId);

        await db.end();

    } catch (error) {

        console.error("❌ Failed to add fish!");
        console.error(error.message);
    }
}

addTestFish();