var network = null;
var layoutMethod = "directed";

function destroy() {
  if (network !== null) {
    network.destroy();
    network = null;
  }
}

function brotherNameToId(name) {
  var bigId;
  brothers.forEach(function (x) {
    if (bigId instanceof Number)
      return;
    if (x.name === name) {
      bigId = x.id;
    }
  });
  return bigId;
}

var colorMethod;
function draw() {
  destroy();
  colorMethod = document.getElementById('layout').value;

  var edges = [];
  for (var i = 0; i < brothers.length; i++) {
    var bro = brothers[i];
    bro.id = i;
    bro.label = bro.name;

    // Add in any edges
    edges.push({from: bro.big, to: bro.id});
  }

  // re-process the edges
  edges.forEach(function (edge) {
    edge.from = brotherNameToId(edge.from);
    brothers[edge.to].bigId = edge.from;
  });

  // TODO(nate): update all colors
  var pledgeClassColor = {
    'fall 2012': 'orange',
    'winter 2013': 'lightgreen',
    'spring 2013': 'salmon',
    'fall 2013': 'blue',
    'winter 2014': 'lightblue',
    'spring 2014': 'purple',
    'fall 2014': 'yellow',
    'winter 2015': 'magenta',
    'spring 2015': 'paleturquoise',
    //'fall 2015': 'orange',
    //'winter 2016': 'orange',
    //'spring 2016': 'orange',
    //'fall 2016': 'orange',
  };

  var familyColor = {
    saints: 'lightblue',
    regulators: 'salmon',
    liberators: 'red',
    'the family': 'lightgreen',
    'the sith and brandon louey': 'yellow',
  };

  function getFamily(node) {
    try {
      if (!(node.family)) {
        node.family = getFamily(brothers[node.bigId]);
      }
    } catch (e) {
      node.family = 'unknown';
    }
    return node.family;
  }

  // re-process the brothers
  brothers.forEach(function (node) {
    getFamily(node);
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
    // console.log(node);
  });

  // create a network
  var container = document.getElementById('mynetwork');
  var data = {
    nodes: brothers,
    edges: edges
  };

  var options = {
    layout: {
      hierarchical: {
        sortMethod: 'directed',
      }
    },
    edges: {
      smooth: true,
      arrows: {to : true }
    }
  };
  network = new vis.Network(container, data, options);
}
