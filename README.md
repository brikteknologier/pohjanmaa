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

* [create a config](#p_create)
* [read a config](#p_read)
* [read a single setting of a config](#p_read_single)
* [update a single setting](#p_update_single)
* [delete a single setting](#p_delete_single)
* [update a whole config](#p_update)
* [using a default config](#p_default)

<a name="p_create"/>
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

<a name="p_read"/>
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

<a name="p_read_single"/>
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

<a name="p_update_single"/>
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

<a name="p_delete_single"/>
I might also want do delete a setting though...

```
DELETE /amazing_cow_server/otherThing.port

>> 204 (no content)
```

<a name="p_update"/>
Amazing! But what if we want to update the entire config?

```
PUT /amazing_cow_server
// request body follows
{ "cows": 500 }
```

<a name="p_default"/>
And what if I have lots of configs but they share lots of settings? Well,
I guess we could have a common base config and have each config just overlayed
on that!

```
POST /_default
// request body follows
{ "aws-credentials": { "super-secret-stuff": "johanna" } }
```

Awesome! Now when I get one of those other configs we created, I get that stuff
too!

```
GET /amazing_cow_server

response
{
  "cows": 500,
  "aws-credentials": {
    "super-secret-stuff": "johanna"
  }
}
```

Outstanding. And now you know how to use Pohjanmaa! Pretty sweet, huh?
