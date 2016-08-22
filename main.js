/* global vis, tinycolor, brothers */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "draw" }] */
var network = null;

function destroy() {
  if (network !== null) {
    network.destroy();
    network = null;
  }
}

var createNodesCalled = false;
var nodes = [];
var edges = [];
var familyColor = {};
var pledgeClassColor = {};

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
  var spinner2 = new ColorSpinner({ h: 0, s: 0.4, v: 0.9 }, 37);
  return function () {
    return spinner2.spin();
  };
}());

// Only call this once (for effiencency & correctness)
function createNodes() {
  if (createNodesCalled) return;
  createNodesCalled = true;

  var oldLength = brothers.length;
  var newIdx = oldLength;

  var familyToNode = {};
  for (var i = 0; i < oldLength; i++) {
    var bro = brothers[i];
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
      // own, so let's put them in both spots

      // Create a placeholder node under his big bro
      edges.push({ from: bro.big, to: newIdx });
      nodes.push(Object.assign({}, bro, {
        id: newIdx++, // increment
        name: '', // some non-existing name
        label: '[' + bro.name + ']',
        family: bro.familystarted.toLowerCase(),
      }));

      // Create the real node under his family
      edges.push({ from: familyToNode[lowerCaseFamily].id, to: bro.id });
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

  // Fix the edges (that point from strings instead of node IDs)
  edges.forEach(function (edge) {
    if (typeof edge.from === 'string') {
      edge.from = nameToNode[edge.from].id;
    }
  });

  function getFamily(node) {
    node.family = node.family || node.familystarted;
    if (node.family) return node.family;
    try {
      if (!(node.family)) {
        node.family = getFamily(node.big);
      }
    } catch (e) {
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
}

function draw() {
  destroy();
  createNodes();
  nodes.forEach(function (node) {
    var colorMethod = document.getElementById('layout').value;
    switch (colorMethod) {
      case 'active':
        node.color = (node.inactive || node.graduated) ? 'lightgrey' : 'lightblue';
        break;
      case 'pledgeClass':
        node.color = pledgeClassColor[(node.pledgeclass || '').toLowerCase()];
        break;
      default: // 'family'
        node.color = familyColor[node.family.toLowerCase()];
        break;
    }
    if (!node.color) node.color = 'lightgrey';
  });

  // create a network
  var container = document.getElementById('mynetwork');
  var data = {
    nodes: nodes,
    edges: edges
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
}
