var network = null;
var layoutMethod = "directed";

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

// Only call this once (for effiencency & correctness)
function createNodes() {
  if (createNodesCalled)
    return;
  createNodesCalled = true;

  var baseColor = new tinycolor({h: 0, s: 0.6, v: 0.9});
  var baseColor2 = new tinycolor({h: 0, s: 0.4, v: 0.9});
  var oldLength = brothers.length;
  var newIdx = oldLength;

  var familyToNode = {};
  for (var i = 0; i < oldLength; i++) {
    var bro = brothers[i];
    bro.id = i;

    var lowerCaseFamily = (bro.familystarted || '').toLowerCase();
    if (lowerCaseFamily && !familyColor[lowerCaseFamily]) {
      // Add a new family
      baseColor = baseColor.spin(77); // some arbitrary spin
      familyColor[lowerCaseFamily] = baseColor.toHexString();

      // Create a root for that family
      var newNode = {
        id: newIdx++, // increment
        name: lowerCaseFamily,
        label: bro.familystarted,
        family: lowerCaseFamily,
        inactive: true, // a family does not count as an active undergraduate
        font: { size: 50 }, // super-size the font
      }
      familyToNode[lowerCaseFamily] = newNode;
      nodes.push(newNode);
    }

    if (bro.big && lowerCaseFamily) {
      // This person has a big bro, but they also started a new family of their
      // own, so let's put them in both spots

      // Create a placeholder node under his big bro
      edges.push({from: bro.big, to: newIdx});
      nodes.push(Object.assign({}, bro, {
        id: newIdx++, // increment
        name: '', // some non-existing name
        label: '[' + bro.name + ']',
        family: bro.familystarted.toLowerCase(),
      }));

      // Create the real node under his family
      edges.push({from: familyToNode[lowerCaseFamily].id, to: bro.id});
    } else if (lowerCaseFamily) {
      // This person founded a family, and has no big bro, so put his node
      // directly underneath the family node
      edges.push({from: familyToNode[lowerCaseFamily].id, to: bro.id});
    } else {
      // This person is just a regular brother
      edges.push({from: bro.big, to: bro.id});
    }
    bro.big = bro.big || lowerCaseFamily;

    var lowerCaseClass = (bro.pledgeclass || '').toLowerCase();
    if (lowerCaseClass && !pledgeClassColor[lowerCaseClass]) {
      // Add a new Pledge Class
      baseColor2 = baseColor2.spin(37); // some arbitrary spin
      pledgeClassColor[lowerCaseClass] = baseColor2.toHexString();
    }

    bro.label = bro.name; // Display the name in the graph

    nodes.push(bro); // Add this to the list of nodes to display
  }

  var nameToNode = {};
  // Change .big from a string to a link to the big brother node
  nodes.forEach(function(bro) {
    if (bro.big) {
      if (nameToNode[bro.big]) {
        bro.big = nameToNode[bro.big];
      } else {
        nodes.forEach(function (bro2) {
          if (bro.big === bro2.name) {
            nameToNode[bro.big] = bro2;
            bro.big = bro2;
          }
        });
      }
    }
  });

  // Fix the edges (that point from strings instead of node IDs)
  edges.forEach(function (edge) {
    if (typeof edge.from === 'string')
      edge.from = nameToNode[edge.from].id;
  });

  function getFamily(node) {
    node.family = node.family || node.familystarted;
    if (node.family)
      return node.family;
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
    if (!node.inactive && !node.graduated)
      familyToNode[node.family.toLowerCase()].inactive = false;
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
      case 'family':
      default:
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
      arrows: {to : true },
    },
  };
  network = new vis.Network(container, data, options);
}
