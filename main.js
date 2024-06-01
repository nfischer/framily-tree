/* global vis, tinycolor, brothers, $, didYouMean */

// Mock out dependencies for testing on NodeJS. These are imported in HTML in
// the browser.
/* eslint-disable */
/* istanbul ignore else */
if (typeof brothers === 'undefined') {
  brothers = require('./relations');
}
/* istanbul ignore else */
if (typeof tinycolor === 'undefined') {
  tinycolor = require('tinycolor2');
}
/* istanbul ignore else */
if (typeof $ === 'undefined') {
  $ = require('jquery');
}
/* istanbul ignore else */
if (typeof vis === 'undefined') {
  vis = require('vis');
}
/* istanbul ignore else */
if (typeof didYouMean === 'undefined') {
  didYouMean = require('didyoumean');
}
/* eslint-enable */

var network = null;

var createNodesCalled = false;
var nodesGlobal;
var edgesGlobal;
var nodesDataSet;
var edgesDataSet;

var previousSearchFind;

var familyColorGlobal = {};
var pledgeClassColorGlobal = {};

function ColorSpinner(colorObj, spinAmount) {
  this.spinAmount = spinAmount;
  this.color = new tinycolor(colorObj);
}
ColorSpinner.prototype.spin = function () {
  this.color = this.color.spin(this.spinAmount);
  return this.color.toHexString();
};

var getNewFamilyColor = (function () {
  var spinner1 = new ColorSpinner({ h: 0, s: 0.6, v: 0.9 }, 77);
  return function () {
    return spinner1.spin();
  };
}());

var getNewPledgeClassColor = (function () {
  var spinner2 = new ColorSpinner({ h: 0, s: 0.4, v: 0.9 }, 23);
  return function () {
    return spinner2.spin();
  };
}());

/* istanbul ignore next */
/**
 * In cases where we can't find an exact match for a brother's name, suggest
 * similar alternatives. This is only called if there is a data entry error, and
 * the purpose is to just give a hint as to how to fix the data entry issue.
 * Since this is only called for data entry bugs, and those data entry bugs
 * should not be submitted into the repo, this is currently untestable.
 */
function didYouMeanWrapper(invalidName) {
  var allValidNames = brothers.map(function (bro) {
    return bro.name;
  });
  // Find valid names which are similar to invalidName.
  var similarValidName = didYouMean(invalidName, allValidNames);
  return similarValidName;
}

function createNodes(brothers_) {
  var oldLength = brothers_.length;
  var newIdx = oldLength;

  var nodes = [];
  var edges = [];
  var familyColor = {};
  var pledgeClassColor = {};

  var familyToNode = {};
  for (var i = 0; i < oldLength; i++) {
    var bro = brothers_[i];
    bro.id = i;

    var lowerCaseFamily = (bro.familystarted || '').toLowerCase();
    if (lowerCaseFamily && !familyColor[lowerCaseFamily]) {
      // Add a new family
      familyColor[lowerCaseFamily] = getNewFamilyColor();

      // Create a root for that family
      var newNode = {
        id: newIdx++, // increment
        name: lowerCaseFamily,
        label: bro.familystarted,
        family: lowerCaseFamily,
        inactive: true, // a family does not count as an active undergraduate
        font: { size: 50 }, // super-size the font
      };
      familyToNode[lowerCaseFamily] = newNode;
      nodes.push(newNode);
    }

    if (bro.big && lowerCaseFamily) {
      // This person has a big bro, but they also started a new family of their
      // own. This person gets two nodes, one underneath their big bro and
      // another underneath their new family.

      // Node underneath the big bro. This is a "fake" node: this will exist in
      // the tree, however you can't search for it and it won't have any little
      // bros.
      edges.push({ from: bro.big, to: newIdx });
      nodes.push(Object.assign({}, bro, {
        id: newIdx++, // increment
        name: '', // some unsearchable name.
        label: '[' + bro.name + ']',
        family: bro.familystarted.toLowerCase(),
      }));

      // Node underneath the new family. This is a "real" node: just like any
      // other node, you can search for it and it will have little bros (if this
      // brother had any little bros).
      var familyNode = familyToNode[lowerCaseFamily];
      edges.push({ from: familyNode.id, to: bro.id });
    } else if (!bro.big && !lowerCaseFamily) {
      /* istanbul ignore next */
      throw new Error(
        'Encountered a little bro ('
        + bro.name
        + ') without a big bro. This is a data entry error.');
    } else if (lowerCaseFamily) {
      // This person founded a family, and has no big bro, so put his node
      // directly underneath the family node
      edges.push({ from: familyToNode[lowerCaseFamily].id, to: bro.id });
    } else {
      // This person is just a regular brother
      edges.push({ from: bro.big, to: bro.id });
    }
    bro.big = bro.big || lowerCaseFamily;

    var lowerCaseClass = (bro.pledgeclass || '').toLowerCase();
    if (lowerCaseClass && !pledgeClassColor[lowerCaseClass]) {
      // Add a new Pledge Class
      pledgeClassColor[lowerCaseClass] = getNewPledgeClassColor();
    }

    bro.label = bro.name; // Display the name in the graph

    nodes.push(bro); // Add this to the list of nodes to display
  }

  var nameToNode = {};
  // Change .big from a string to a link to the big brother node
  nodes.forEach(function (member) {
    if (member.big) {
      if (nameToNode[member.big]) {
        member.big = nameToNode[member.big];
      } else {
        nodes.forEach(function (member2) {
          if (member.big === member2.name) {
            nameToNode[member.big] = member2;
            member.big = member2;
          }
        });
      }
    }
  });

  // Fix the edges that point from strings instead of node IDs
  edges.forEach(function (edge) {
    if (typeof edge.from === 'string') {
      var name = edge.from;
      var node = nameToNode[name];
      /* istanbul ignore next */
      if (!node) {
        var correctedName = didYouMeanWrapper(name);
        var msg;
        if (!correctedName) {
          msg = 'Unable to find a match for '
            + JSON.stringify(name);
        } else if (name.trim() === correctedName.trim()) {
          msg = 'Inconsistent whitespace. Expected to find '
            + JSON.stringify(correctedName)
            + ', but actually found ' + JSON.stringify(name) + '. These should '
            + 'have consistent whitespace.';
        } else {
          msg = 'Unable to find ' + JSON.stringify(name)
            + ', did you mean ' + JSON.stringify(correctedName)
            + '?';
        }
        throw new Error(msg);
      }
      edge.from = node.id;
    }
  });

  function getFamily(node) {
    node.family = node.family || node.familystarted;
    if (node.family) return node.family;
    try {
      node.family = getFamily(node.big);
    } catch (e) {
      /* istanbul ignore next */
      node.family = 'unknown';
    }

    return node.family;
  }

  // re-process the brothers
  // Color all the nodes (according to this color scheme)
  nodes.forEach(function (node) {
    // Get the family information
    getFamily(node);

    // Mark the family as active (if it has 1 or more active members)
    if (!node.inactive && !node.graduated) {
      familyToNode[node.family.toLowerCase()].inactive = false;
    }
  });

  return [nodes, edges, familyColor, pledgeClassColor];
}

// Only call this once (for effiencency & correctness)
/* istanbul ignore next */
function createNodesHelper() {
  if (createNodesCalled) return;
  createNodesCalled = true;

  var output = createNodes(brothers);
  nodesGlobal = output[0];
  edgesGlobal = output[1];
  familyColorGlobal = output[2];
  pledgeClassColorGlobal = output[3];

  nodesDataSet = new vis.DataSet(nodesGlobal);
  edgesDataSet = new vis.DataSet(edgesGlobal);
}

function findBrother(name, nodes, prevElem) {
  var lowerCaseName = name.toLowerCase();
  var matches = nodes.filter(function (element) {
    return element.name.toLowerCase().includes(lowerCaseName);
  });
  if (matches.length === 0) {
    return undefined;
  }

  var idx = 0;
  if (prevElem) {
    idx = matches.indexOf(prevElem);
    idx = (idx + 1) % matches.length;
  }
  return matches[idx];
}

/**
 * Searches for the specific brother (case-insensitive, matches any substring).
 * If found, this zooms the network to focus on that brother's node.
 *
 * Returns whether or not the search succeeded. This always returns `true` for
 * an empty query.
 */
/* istanbul ignore next */
function findBrotherHelper(name) {
  if (!name) return true; // Don't search for an empty query.
  // This requires the network to be instantiated, which implies `nodesGlobal`
  // has been populated.
  if (!network) return false;

  var found = findBrother(name, nodesGlobal, previousSearchFind);
  previousSearchFind = found;

  if (found) {
    network.focus(found.id, {
      scale: 0.9,
      animation: true,
    });
    network.selectNodes([found.id]);
    return true;
  }
  return false; // Could not find a match
}

/* istanbul ignore next */
function draw() {
  createNodesHelper();

  var changeColor;
  var colorMethod = document.getElementById('layout').value;
  switch (colorMethod) {
    case 'active':
      changeColor = function (node) {
        node.color = (node.inactive || node.graduated)
          ? 'lightgrey' : 'lightblue';
        nodesDataSet.update(node);
      };
      break;
    case 'pledgeClass':
      changeColor = function (node) {
        node.color = node.pledgeclass
          ? pledgeClassColorGlobal[node.pledgeclass.toLowerCase()]
          : 'lightgrey';
        nodesDataSet.update(node);
      };
      break;
    default: // 'family'
      changeColor = function (node) {
        node.color = familyColorGlobal[node.family.toLowerCase()];
        nodesDataSet.update(node);
      };
      break;
  }
  nodesGlobal.forEach(changeColor);
  if (!network) {
    // create a network
    var container = document.getElementById('mynetwork');
    var data = {
      nodes: nodesDataSet,
      edges: edgesDataSet,
    };

    var options = {
      layout: {
        hierarchical: {
          sortMethod: 'directed',
        },
      },
      edges: {
        smooth: true,
        arrows: { to: true },
      },
    };
    network = new vis.Network(container, data, options);
  } else {
    network.redraw();
  }
}

/* istanbul ignore next */
// This section is intended to only run in the browser, it does not run in
// nodejs.
if (typeof document !== 'undefined') {
  $(document).ready(function () {
    // Start the first draw
    draw();

    // Search feature
    var dropdown = document.getElementById('layout');
    dropdown.onchange = function () {
      draw();
    };
    function search() {
      var query = $('#searchbox').val();
      var success = findBrotherHelper(query);

      // Indicate if the search succeeded or not.
      if (success) {
        $('#searchbox').css('background-color', 'white');
      } else {
        $('#searchbox').css('background-color', '#EEC4C6'); // red matching flag
      }
    }
    document.getElementById('searchbox').onkeypress = function (e) {
      if (!e) e = window.event;
      var keyCode = e.keyCode || e.which;
      if (keyCode === '13' || keyCode === 13 /* Enter */) {
        search();
      }
    };
    document.getElementById('searchbutton').onclick = search;
  });
}

/* istanbul ignore else */
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports.createNodes = createNodes;
  module.exports.createNodesHelper = createNodesHelper;
  module.exports.findBrother = findBrother;
}
