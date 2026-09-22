const db = require("./db");

async function testDatabase() {
    try {
        const [rows] = await db.query("SELECT 1 AS result");

        console.log("✅ MySQL connection successful!");
        console.log(rows);

        await db.end();
    } catch (error) {
        console.error("❌ MySQL connection failed!");
        console.error(error.message);
    }
}

testDatabase();