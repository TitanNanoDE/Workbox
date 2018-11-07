# Workbox

Workbox is a desktop environment (simulator?) in your web browser.
Currently it can't do a lot and is mostly very alpha.

But it's build with web workers, so that's cool.

## Install

To locally install Workbox on your machine you have to clone the repo,

```
git clone git@github.com:TitanNanoDE/Workbox.git
```

install all dependencies,

```
npm i
```

and you might have to set up sub modules.
Depending on the current state of the project, there will be different sub modules.

```
git submodule init
```

## Build
To build the project, make sure you have `gulp-cli`, then run it inside the project dir.
```
gulp
```

## Run
To run Workbox it has to be served by a web server. You can use Nginx, Apache2 or anything else.
