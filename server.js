const express = require("express");
const app = express();
const port = 3000;

const { REDIS_URL } = process.env;
const redis = require("redis");
const client = redis.createClient({ url: REDIS_URL });
const ulid = require("ulid");

//this will write errors
client.on("error", (error) => {
	console.log("Redis Client Error:", error);

});

// Connect to Redis on server start
client.connect()
  .then(() => console.log("Connected to Redis"))
  .catch((err) => console.error("Failed to connect to Redis:", err));

app.use(express.json({ limit: '10kb' }));

app.post("/lotteries", async (req, res) => {
const { type, name, prize} = req.body;

 if (type !== "simple") {
 	res.status(422).json({ error: "invalid lottery type"})
 	return;
 }

 if (typeof name !== "string" || name.length < 3) {
 	res.status(422).json({ error: "invalid lottery name"});
 	return;
 }

 if (typeof prize !== "string" || name.length < 3) {
 	res.status(422).json({ error: "Invalid lottery prize"});
 	return;
 }

 const id = ulid.ulid();
 const newLottery = {
 	id,
 	name,
 	prize,
 	type,
 	status: "running"
 };

 try {

	console.log("New Lottery Data:", newLottery);
	console.log("Attempting Redis Multi command...");

	await client
		.multi()
		.hSet(`lottery.${id}`, newLottery)
		.lPush("lotteries", id)
	.exec();

	console.log("Redis command executed successfully");
	res.json(newLottery);
}	catch (error) {
	console.error("Error during lottery creation:", error);
	res.status(500).json({ error: "failed to create lottery"});
}
});

app.get("/", (req, res) => {
	// send an empty object as response
	res.json({});
});

app.get("/lottery/:id", async (req, res) => {
	// get individual lottery
	const id = req.params.id;

	try {
		console.log("getting an individual lottery");

		await client
		.hGet(id, "name")
		.exec();
	}	catch (error) {
		console.error("Error during lottery fetch by id:", error);
		res.status(500).json({ error: "failed to fetch lottery"});
	}
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});