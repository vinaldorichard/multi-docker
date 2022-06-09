const keys = require("./keys");

// Express App Setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors()); // Cross-Origin Resource Sharing -> allows connection from one domain to diffrent domain (different port)
app.use(bodyParser.json()); // Parse form into json value

// Postgres Client Setup
const { Pool } = require("pg");
// Create pool
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

// Error listener
pgClient.on('error', () => console.log('Lost PG connection'));

// Connect to database
pgClient.on("connect", (client) => {
    client
        .query("CREATE TABLE IF NOT EXISTS values (number INT)") // Create table values with column number
        .catch((err) => console.error(err));
});

// Redis Client Setup
const redis = require('redis');
// Create redis client
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000 // reconnect every 1000 if lose connection
});
// Create redis publisher
const redisPublisher = redisClient.duplicate(); // If there is client that listening to message / publish information we need to create duplicate

// Express route handler
app.get('/', (req, res) => {
    res.send('Hi')
})

// Retrieve all values have been submitted from postgres db
app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * from values');
    // Send back response
    res.send(values.rows);
})

// Retrieve calculated values fibonacci that have been submitted
app.get('/values/current', async (req, res) => {
    // Lookup hash values

    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    })
})

// Receive new values from react application
app.post('/values', async (req, res) => {
    const index = req.body.index;
    // Make sure the index is less than 40 (not wait too long)
    if (parseInt(index) > 40) {
        return res.status(422).send('Index too high');
    }
    // Set the hash values into redis store
    redisClient.hset('values', index, 'Nothing yet!');
    // Publish to worker process
    redisPublisher.publish('insert', index);
    // Insert into postgres db
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
    // Success response
    res.send({ working: true });
})

// Listen to port
app.listen(5000, err => {
    console.log('Listening')
    if (err) {
        console.log(err)
    }
})