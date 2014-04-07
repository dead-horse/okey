okey
====

a small high layer framework base on [koa](https://github.com/koajs/koa)
it is more like a guide, simplify use koa with so many middlewares.

**under heavy development now. and i still do not completely figure out what `okey` really need.**

## Example

checkout a simple [example](https://https://github.com/dead-horse/okey/blob/master/example).

## Dependencies

to make module's update do not affect the main framework. all the dependencies not required by `okey`, if you use any middlewares, it will remind you to install which module.
also a module like [koa-middlewares](https://github.com/dead-horse/koa-middlewares) will provide, so you add all dependencies much easier.

## Generator

throw the generator, you can get your own app quickly. this generator also will be a seperate module. the files tree may like:

```
app.js
package.json
public
models
controllers
views
```

##Licnese

MIT
