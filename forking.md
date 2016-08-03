# Forking this project

If you're interested in adapting this project to work for you, here's the
minimum changes you'll need to do:

## Google Doc

You'll first have to set up the Google Doc. To do this, you should go to my
[google
doc](https://docs.google.com/spreadsheets/d/1h6dVJKtETWX3Kr9PT6EaLu0gGavdi8Gnj4IlX155pfY/edit#gid=0).
Make sure you're signed in to a Google account, and click "File > Make a copy."
You can delete the data rows if you want a different data set, but make sure to
keep the header row the same (unless you know what you're doing).

In your new copy, click "File > Publish to the web." This is necessary so that
the Google Spreadsheets npm package can download the data as JSON.

Keep your doc open, because you'll need the spreadsheet ID later.

## Github repository

Go to [my repository](https://github.com/nfischer/framily-tree) and click the
"Fork" button. Your new fork can be either public or private.

Clone the repository to your local machine (remember to change your username):

```bash
$ git clone https://github.com/<yourUserName>/framily-tree.git
$ cd framily-tree/
```

Next, edit the file `scripts/getData.js` and change `spreadsheetId` to be
whatever your spreadsheet ID is on your forked Google Doc (it's the part of the
URL between `spreadsheets/d/` and `/edit#gid=0`).

## Adding your data

Add in whatever data you like in your new spreadsheet. You can append to the
data I have, modify it, or write in completely new data (but it must follow the
same schema). Once you've done that, go to your terminal and run:

```bash
$ npm install
$ npm run getData
$ git status # see what has changed
```

You should see that `relations.js` has now changed. This means you've downloaded
the new data. Run `npm start` and see it live in the network graph (family
tree).

## Publishing to your own fork

Once you're satisfied with the changes, commit the changes (`git commit -am
"Update data"`), push the changes (`git push origin master`), and deploy them to
Github Pages (`npm run deploy`). After a minute or two, you should be able to
view them at `https://<yourUserName>.github.io/framily-tree`.

## Further reading

 - [Downloading Google spreadsheets as
   JSON](https://github.com/bassarisse/google-spreadsheet-to-json)
 - Building network graphs: [here](http://visjs.org/) and
   [here](https://github.com/almende/vis)
