# Framily tree

Check it out [online](https://nfischer.github.io/framily-tree).

## How does it work?

When I set out, I had a few goals I tried to stick to:

 1. Easy to maintain/update
 2. Easy to share
 3. Interactive
 4. Free (fraternities are poor) to host/maintain/update/etc.

To make it interactive, it really needs to be a website. And to keep it free,
Github Pages seems like a good option. Unfortunately, since Github Pages only
lets you deploy static sites, that meant I had to figure out how to build this
without a backend, all while keeping it easy to update.

### The resulting design

This is divided into a few different parts:

 1. The static site (which you hopefully don't need to touch)
 2. A [google
    doc](https://docs.google.com/spreadsheets/d/1h6dVJKtETWX3Kr9PT6EaLu0gGavdi8Gnj4IlX155pfY/edit#gid=0)
    holding the data (free & easy to use)
 3. The tools to link them together (aka a bunch of `npm` scripts)

To update the data, just add all the new fraternity initiates to the google
spreadsheet online. To pull those changes into the project and launch the
results, use [easy mode](#easy-mode):

```
$ npm run easyMode
```

### Design consequences

This requires that the maintainer know how to use Google Spreadsheets (which is
easy) and also some basic knowledge of the commandline and `npm` (which is a bit
harder). This can be avoided if you're willing to shell out money for a backend,
but making this free was one of my goals, so that's what I went with. But if you
have someone in your fraternity who knows a bit of coding and can enter data in
a spreadsheet, this should be a breeze to use.

## Building (or maintaining) the project

Install dependencies:

```bash
$ npm install
```

Fetch the latest data from the Google Doc:

```
$ npm run getData
```

Run the project locally:

```
$ npm start
```

Deploy the latest changes (after you've committed)

```
$ npm run deploy
```

### Easy mode

If all that sounds scary, just use **easy mode** to fetch the data, save it, and
update the website (all at once):

```
$ npm run easyMode
```

## License

All original source files are licensed under the MIT license. All dependencies
are licensed under their respective open source licenses. The Theta Chi flag
image was downloaded from [this
site](https://upload.wikimedia.org/wikipedia/en/d/df/OX_Flag.png). The data
displayed on this web page is populated by [this google
spreadsheet](https://docs.google.com/spreadsheets/d/1h6dVJKtETWX3Kr9PT6EaLu0gGavdi8Gnj4IlX155pfY/edit?usp=sharing)
and is property of Theta Chi Fraternity Beta Alpha chapter and its initiates.
