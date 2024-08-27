let videoTags = {};
let selectedTags = new Set();

// Load video tags from JSON file
fetch('/videoTags.json')
  .then(response => response.json())
  .then(data => {
    videoTags = data;
    createTagCheckboxes();
  })
  .catch(error => console.error('Error loading video tags:', error));

function createTagCheckboxes() {
  const tagContainer = document.getElementById('tagContainer');
  const allTags = new Set();

  // Collect all unique tags
  Object.values(videoTags).forEach(tags => {
    tags.forEach(tag => allTags.add(tag));
  });

  //  aucotmatically create checkboxes for each tag once their in the tags.json file.
  allTags.forEach(tag => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `tag-${tag}`;
    checkbox.value = tag;

    const label = document.createElement('label');
    label.htmlFor = `tag-${tag}`;
    label.textContent = tag;

    checkbox.addEventListener('change', handleTagSelection);

    tagContainer.appendChild(checkbox);
    tagContainer.appendChild(label);
    tagContainer.appendChild(document.createElement('br'));
  });
}

function handleTagSelection(event) {
  const tag = event.target.value;
  if (event.target.checked) {
    selectedTags.add(tag);
  } else {
    selectedTags.delete(tag);
  }
}

function isVideoAllowed(videoNumber) {
  if (selectedTags.size === 0) return true; // If no tags selected, allow all videos
  const videoTagList = videoTags[videoNumber] || [];
  return videoTagList.some(tag => selectedTags.has(tag));
}
