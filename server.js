const express = require("express");
const app = express();
const port = 3000;

const { REDIS_URL } = process.env;
const redis = require("redis");
const client = redis.createClient({ url: REDIS_URL });
const ulid = require("ulid");

//this will write errors
client.on("error", (error) => {
	console.log(error);

});

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
	await client
		.multi()
		.hSet(`lottery.${id}`, newLottery)
		.lPush("lotteries", id)
	.exec();

	res.json(newLottery);
}	catch (error) {
	console.error(error);
	res.status(500).json({ error: "failed to create lottery"});
}
});

app.get("/", (req, res) => {
	// send an empty object as response
	res.json({});
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});