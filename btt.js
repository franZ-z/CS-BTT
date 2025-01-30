document.getElementById("createTree").addEventListener("click", function () {
  const levels = parseInt(document.getElementById("levels").value);
  const nodes = parseInt(document.getElementById("nodes").value);

  const errorMessage = document.getElementById("error-message");
  errorMessage.style.display = "none"; // Hide any previous error messages

  if (isNaN(levels) || levels < 1 || levels > 5) {
    errorMessage.style.display = "block";
    errorMessage.textContent = "Please enter a level between 1 and 5.";
    return;
  }
  if (isNaN(nodes) || nodes < 1 || nodes > 32) {
    errorMessage.style.display = "block";
    errorMessage.textContent =
      "Please enter a number of nodes between 1 and 32.";
    return;
  }
  if (nodes < levels) {
    errorMessage.style.display = "block";
    errorMessage.textContent =
      "Invalid number of nodes for the selected level.";
    return;
  }

  const tree = generateBinaryTree(levels, nodes);
  if (tree) {
    visualizeTree(tree);
    // Make the traverse button visible after tree creation
    document.getElementById("traverseTree").style.display = "inline-block";
  }
});

document.getElementById("resetTree").addEventListener("click", function () {
  // Clear the tree visualization
  const container = document.getElementById("tree-visualization");
  container.innerHTML = ""; // Clears the tree display

  // Reset the traversals section
  const traversalsDiv = document.getElementById("traversals");
  traversalsDiv.innerHTML = ""; // Clears the traversals display

  // Clear the input fields (set them to blank)
  document.getElementById("levels").value = "";
  document.getElementById("nodes").value = "";

  // Hide the traverse button
  document.getElementById("traverseTree").style.display = "none";

  // Reset tree container size back to the default
  const treeContainer = document.getElementById("tree-container");
  treeContainer.style.height = "auto"; // Revert to original size

  const errorMessage = document.getElementById("error-message");
  errorMessage.style.display = "none";
});

document.getElementById("traverseTree").addEventListener("click", function () {
  const levels = parseInt(document.getElementById("levels").value);
  const nodes = parseInt(document.getElementById("nodes").value);

  const errorMessage = document.getElementById("error-message");
  errorMessage.style.display = "none"; // Hide any previous error messages

  if (isNaN(levels) || isNaN(nodes) || nodes < 1 || levels < 1) {
    errorMessage.style.display = "block";
    errorMessage.textContent = "Please create a tree first!";
    return;
  }

  const tree = generateBinaryTree(levels, nodes);
  if (tree) {
    displayTraversals(tree);
    // Show the traversals section
    const traversalsDiv = document.getElementById("traversals");
    traversalsDiv.style.display = "block";

    // Increase the tree container size to accommodate the traversal
    const treeContainer = document.getElementById("tree-container");
    treeContainer.style.height = "600px"; // Adjust this value as needed
  }
});

function checkLevelDistribution(levels, nodes) {
  const levelRanges = {
    1: [1],
    2: [2, 3],
    3: [4, 7],
    4: [8, 15],
    5: [16, 32],
  };

  const minNodes = levelRanges[levels][0];
  const maxNodes = levelRanges[levels][1];

  return nodes >= minNodes && nodes <= maxNodes;
}

function generateBinaryTree(levels, nodes) {
  const maxNodes = 2 ** levels - 1;
  if (nodes > maxNodes) {
    alert(`Too many nodes for level ${levels}!`);
    return null;
  }

  const nodeValues = Array.from({ length: nodes }, (_, i) =>
    String.fromCharCode(65 + i)
  );
  const tree = {};

  // Function to assign nodes in a right-skewed manner (when nodes == levels)
  function generateSkewedTree() {
    let currentIndex = 0;
    for (let level = 0; level < levels; level++) {
      const parent = nodeValues[currentIndex];
      tree[parent] = [];
      // Only add a right child
      if (currentIndex + 1 < nodes) {
        tree[parent].push(nodeValues[currentIndex + 1]);
      }
      currentIndex++;
    }
  }

  // Function to assign nodes according to the level distribution rule
  function generateDistributedTree() {
    let currentIndex = 0;
    const levelSizes = [1, 2, 4, 8, 16]; // Nodes per level

    for (let level = 0; level < levels; level++) {
      const levelNodeCount = Math.min(levelSizes[level], nodes - currentIndex);
      for (let i = 0; i < levelNodeCount; i++) {
        const parent = nodeValues[currentIndex];
        tree[parent] = [];
        if (currentIndex * 2 + 1 < nodes)
          tree[parent].push(nodeValues[currentIndex * 2 + 1]); // Left child
        if (currentIndex * 2 + 2 < nodes)
          tree[parent].push(nodeValues[currentIndex * 2 + 2]); // Right child
        currentIndex++;
      }
    }
  }

  // If nodes == levels, generate a skewed tree
  if (nodes === levels) {
    generateSkewedTree(); // Skewed tree if nodes == levels
  } else {
    generateDistributedTree(); // Distribute nodes based on the pattern
  }

  return tree;
}

function visualizeTree(tree) {
  const container = document.getElementById("tree-visualization");
  container.innerHTML = "";

  const nodes = [];
  const edges = [];

  const levelMap = new Map();

  // Assign levels to nodes
  function assignLevels(node, level) {
    if (!levelMap.has(level)) {
      levelMap.set(level, []);
    }
    if (!levelMap.get(level).includes(node)) {
      levelMap.get(level).push(node);
    }
    tree[node]?.forEach((child) => assignLevels(child, level + 1));
  }

  assignLevels(Object.keys(tree)[0], 0);

  // Create nodes and edges for visualization
  levelMap.forEach((levelNodes, level) => {
    levelNodes.forEach((node) => {
      nodes.push({ id: node, label: node, level });
      tree[node]?.forEach((child) => {
        edges.push({ from: node, to: child });
      });
    });
  });

  const data = { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
  const options = {
    layout: {
      hierarchical: {
        direction: "UD", // Ensure nodes go from top to bottom
        sortMethod: "directed", // Ensures the nodes are correctly aligned
        levelSeparation: 100,
        nodeSpacing: 150, // Increased space between nodes for better clarity
        treeSpacing: 150, // Ensures that children are spread sufficiently
        parentCentralization: true,
      },
    },
    nodes: {
      shape: "circle",
      size: 30,
      color: "#6CA0DC",
      font: { color: "#fff" },
    },
    edges: {
      lines: { to: { enabled: true } },
      smooth: true,
      length: 10,
    },
  };

  new vis.Network(container, data, options);
}

function displayTraversals(tree) {
  const postorder = [];
  const preorder = [];
  const inorder = [];

  function traverse(node) {
    if (!node) return;

    preorder.push(node); // Add node to preorder first (root before left and right)
    if (tree[node].length > 0) traverse(tree[node][0]); // Left child first
    inorder.push(node); // Add node to inorder after left subtree
    if (tree[node].length > 1) traverse(tree[node][1]); // Right child second
    postorder.push(node); // Add node to postorder after both children
  }

  traverse(Object.keys(tree)[0]);

  function formatTraversal(sequence) {
    return sequence
      .map((node) => `<span class="traversal-node">${node}</span>`)
      .join("");
  }

  const traversalsDiv = document.getElementById("traversals");
  traversalsDiv.innerHTML = ` 
        <p><strong>Inorder:</strong> ${formatTraversal(inorder)}</p>
        <p><strong>Preorder:</strong> ${formatTraversal(preorder)}</p>
        <p><strong>Postorder:</strong> ${formatTraversal(postorder)}</p>
      `;
}
