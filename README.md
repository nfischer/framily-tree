# Framily tree

[![GitHub Actions][Actions badge]][GitHub Workflow]
[![Codecov][Codecov badge]][Codecov link]
[![Try online](https://img.shields.io/badge/try_it-online!-yellow.svg?style=flat-square)][GitHub Pages]

Check it out [online][GitHub Pages].

## What is this?

This is an interactive family tree for my fraternity. This shows family lineage
while also allowing users to interact to better navigate and understand the
history:

 * Change color coding to organize the tree by family, pledge class, or members'
   active status
 * Use the search function to quickly find particular fraternity members in the
   tree
 * Play around with graph nodes (they bounce around and collide with each other
   using a physics engine!)

This family tree is entirely data-driven and easy to update. Data is pulled from
a [google spreadsheet].

## How does it work?

Check out the [design overview](https://github.com/nfischer/framily-tree/wiki/Design).

## Maintaining this family tree

Updating the data? Adding new members to the tree? See the instructions
[here](https://github.com/nfischer/framily-tree/wiki/Updating-data-(adding-new-members)).

## Creating your own family tree

Check out the [forking
instructions](https://github.com/nfischer/framily-tree/wiki/Forking-instructions).

## License

All original source files are licensed under the MIT license. All dependencies
are licensed under their respective open source licenses. The Theta Chi flag
image was downloaded from [this
site](https://upload.wikimedia.org/wikipedia/en/d/df/OX_Flag.png). The data
displayed on this web page is populated by this [google spreadsheet] and is
property of Theta Chi Fraternity Beta Alpha chapter and its initiates.

<!--
  Forking instructions: if you are forking this project for your own
  fraternity, you will need to change these links to point to the right data for
  your project:
-->

[Actions badge]: https://img.shields.io/github/actions/workflow/status/nfischer/framily-tree/main.yml?style=flat-square&logo=github
[GitHub Workflow]: https://github.com/nfischer/framily-tree/actions/workflows/main.yml
[GitHub Pages]: https://nfischer.github.io/framily-tree
[Codecov badge]: https://img.shields.io/codecov/c/github/nfischer/framily-tree/main.svg?style=flat-square&label=coverage
[Codecov link]: https://codecov.io/gh/nfischer/framily-tree
[google spreadsheet]: https://docs.google.com/spreadsheets/d/1h6dVJKtETWX3Kr9PT6EaLu0gGavdi8Gnj4IlX155pfY/edit?usp=sharing
