const fs = require('fs');
const path = require('path');

const fixItems = (items) => {
  if (!items) return items;

  let newItems = [];
  items.forEach(item => {
    if (item.text === 'None' || item.text === 'Other') {
      if (item.items) newItems.push(...item.items);
    } else {
      if (item.items) item.items = fixItems(item.items);
      newItems.push(item);
    }
  });

  newItems.sort((a, b) => {
    const aHasSubItems = a.items?.length > 0;
    const bHasSubItems = b.items?.length > 0;
    if (aHasSubItems && !bHasSubItems) return 1;
    if (!aHasSubItems && bHasSubItems) return -1;
    return a.text.localeCompare(b.text);
  });

  return newItems;
};

exports.processSidebar = (outDir) => {
  const sidebarPath = path.resolve(outDir, 'typedoc-sidebar.json');
  if (!fs.existsSync(sidebarPath)) return;

  try {
    const sidebar = JSON.parse(fs.readFileSync(sidebarPath, 'utf-8'));
    const fixedSidebar = fixItems(sidebar);
    fs.writeFileSync(sidebarPath, JSON.stringify(fixedSidebar, null, 2));
  } catch (err) {
    console.error('Error post-processing sidebar:', err);
  }
};
