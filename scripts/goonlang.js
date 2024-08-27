function parseGoonLangCommand(command) {
  const commands = command.split(",");
  let actions = [];
  let excludedTags = new Set();
  let mutedItems = new Set();

  commands.forEach((cmd, index) => {
    cmd = cmd.trim();
    
    if (cmd.startsWith("<<<")) {
      const videoNumber = cmd.substring(3);
      actions.push({ type: "position", videoNumber, position: "leftmost" });
      actions.push({ type: "play", target: videoNumber });
    } else if (cmd.startsWith(">>>")) {
      const videoNumber = cmd.substring(3);
      actions.push({ type: "position", videoNumber, position: "rightmost" });
      actions.push({ type: "play", target: videoNumber });
    } else if (cmd.startsWith("<<")) {
      const videoNumber = cmd.substring(2);
      const referenceNumber = commands[index - 1].trim();
      actions.push({ type: "position", videoNumber, position: "leftOf", referenceNumber });
      actions.push({ type: "play", target: videoNumber });
    } else if (cmd.startsWith(">>")) {
      const videoNumber = cmd.substring(2);
      const referenceNumber = commands[index - 1].trim();
      actions.push({ type: "position", videoNumber, position: "rightOf", referenceNumber });
      actions.push({ type: "play", target: videoNumber });
    } else if (cmd.startsWith("--")) {
      const tag = cmd.substring(2);
      actions.push({ type: "closeTag", tag });
    } else if (cmd.startsWith("-")) {
      const tag = cmd.substring(1);
      excludedTags.add(tag);
    } else if (cmd.startsWith("?")) {
      const item = cmd.substring(1);
      mutedItems.add(item);
      actions.push({ type: "play", target: item, muted: true });
    } else {
      // Handle regular video number or tag
      actions.push({ type: "play", target: cmd, muted: mutedItems.has(cmd) });
    }
  });

  return { actions, excludedTags };
}

function executeGoonLang(parsedCommand) {
  console.log("Executing GoonLang actions:", parsedCommand);
  const { actions, excludedTags } = parsedCommand;

  actions.forEach(action => {
    switch(action.type) {
      case "play":
        if (!excludedTags.has(action.target)) {
          console.log(`Playing ${action.muted ? "muted " : ""}video/tag ${action.target}`);
          playVideo(action.target, action.muted);
        }
        break;
      case "position":
        console.log(`Positioning video ${action.videoNumber} ${action.position} ${action.referenceNumber || ''}`);
        setTimeout(() => {
          positionVideo(action.videoNumber, action.position, action.referenceNumber);
        }, 500);
        break;
      case "closeTag":
        console.log(`Closing videos with tag ${action.tag}`);
        closeVideosByTag(action.tag);
        break;
    }
  });
}

function positionVideo(videoNumber, position, referenceNumber) {
  const column = myLayout.root.contentItems[0];
  let targetVideo, referenceVideo;

  // Find the target video and reference video
  column.contentItems.forEach((row) => {
    row.contentItems.forEach((item) => {
      if (item.config.title === `GOONSCREEN ${videoNumber}`) {
        targetVideo = item;
      }
      if (referenceNumber && item.config.title === `GOONSCREEN ${referenceNumber}`) {
        referenceVideo = item;
      }
    });
  });

  if (!targetVideo) {
    console.error(`Video ${videoNumber} not found`);
    return;
  }

  // Remove the target video from its current position
  targetVideo.parent.removeChild(targetVideo);

  switch (position) {
    case "leftmost":
      column.contentItems[0].addChild(targetVideo, 0);
      break;
    case "rightmost":
      column.contentItems[column.contentItems.length - 1].addChild(targetVideo);
      break;
    case "leftOf":
    case "rightOf":
      if (!referenceVideo) {
        console.error(`Reference video ${referenceNumber} not found`);
        return;
      }
      const referenceIndex = referenceVideo.parent.contentItems.indexOf(referenceVideo);
      referenceVideo.parent.addChild(targetVideo, position === "leftOf" ? referenceIndex : referenceIndex + 1);
      break;
  }

  console.log(`Repositioned video ${videoNumber} ${position} ${referenceNumber || ''}`);
}

function closeVideosByTag(tag) {
  const column = myLayout.root.contentItems[0];
  column.contentItems.forEach((row) => {
    const itemsToRemove = row.contentItems.filter((item) => {
      const videoNumber = item.config.title.split(' ')[1];
      return videoTags[videoNumber] && videoTags[videoNumber].includes(tag);
    });
    itemsToRemove.forEach((item) => row.removeChild(item));
  });
}

// This function should be updated in goonscreen.js
function playVideo(target, muted = false) {
  // If target is a number, play that video
  if (!isNaN(target)) {
    // Existing video playing logic
    // Add muting logic here
  } else {
    // If target is a tag, play all videos with that tag
    Object.keys(videoTags).forEach(videoNumber => {
      if (videoTags[videoNumber].includes(target)) {
        // Existing video playing logic
        // Add muting logic here
      }
    });
  }
}
