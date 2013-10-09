# pohjanmaa

**serve, save and update a set of configs atomically.**

Pohjanmaa is a config server based on redis that allows for atomic updates of
configs based on key paths.

## install

```
git clone http://github.com/brikteknologier/pohjanmaa
node pohjanmaa
```

Pohjanmaa is based on redis, so you should have a redis server running. You can
configure the redis server by using the `--redis-port` and `--redis-host`
options when starting pohjanmaa.

## usage

Lets say we have a config that looks like this:

```json
{
  port: 5002,
  otherThing: {
    port: 2005
  }
}
```

Let's say this is our config for `amazing_cow_server`. OK! Lets save it in
Pohjanmaa.

```
POST /amazing_cow_server
// request body follows
{
  "port": 5002,
  "otherThing": {
    "port": 2005
  }
}
```

Cool! It's now saved in Pohjanmaa. Lets get it out again

```
GET /amazing_cow_server

response:
{
  "port": 5002,
  "otherThing": {
    "port": 2005
  }
}
```

Or, just a single setting:

```
GET /amazing_cow_server/port

response:
5002
```

What about a nested setting:

```
GET /amazing_cow_server/otherThing.port

response:
2005
```

Sweet! But I want to update it now. Shall we do a single setting?

```
PUT /amazing_cow_server/port
// request body follows
10501
```

Awesome! What about a nested setting?

```
PUT /amazing_cow_server/otherThing.port
// request body follows
20502
```

Amazing! But what if we want to update the entire config?

```
PUT /amazing_cow_server
// request body follows
{ "cows": 500 }
```

Outstanding. And now you know how to use Pohjanmaa! Pretty sweet, huh?
