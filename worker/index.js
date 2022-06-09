// Require internal modules
const keys = require("./keys");
const redis = require("redis");

// Create redis client
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000 // reconnect every 1000
})

// Duplicate of redis client
const sub = redisClient.duplicate();

// Function to calculate fibonacci
function fib(index) {
    if (index < 2) return 1; // [0,1] = 1
    return fib(index - 1) + fib(index - 1); // Recursive solution : [2] = [0] + [1] -> Slow ! -> Worker
}

// Watch redis (subscribe) and get new message (event emitter)
sub.on('message', (channel, message) => {
    // Hash of values -> [key, value] = [index, value]

    redisClient.hset('values', message, fib(parseInt(message)));
});

// Watch for any insert events
sub.subscribe('insert'); 