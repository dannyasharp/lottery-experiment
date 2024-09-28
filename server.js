const express = require("express");
const app = express();
const port = 3000;

const { REDIS_URL } = process.env;
console.log(REDIS_URL);

app.use(express.json({ limit: '10kb' }));

app.get("/", (req, res) => {
	// send an empty object as response
	res.json({});
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});