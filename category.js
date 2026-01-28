const container = document.getElementById('category-list');

const renderCard = (listing) => {
  const article = document.createElement('article');
  article.className = 'category-card';

  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = listing.regionLabel;

  const title = document.createElement('h3');
  title.textContent = listing.name;

  const summary = document.createElement('p');
  summary.className = 'muted';
  summary.textContent = listing.summary;

  const link = document.createElement(listing.link ? 'a' : 'button');
  link.className = listing.link ? 'btn small' : 'btn ghost small';
  link.textContent = listing.link ? 'View details' : 'Preview soon';
  if (listing.link) {
    link.setAttribute('href', listing.link);
  } else {
    link.setAttribute('type', 'button');
  }

  article.append(badge, title, summary, link);
  return article;
};

const regionLabels = {
  south: 'South',
  central: 'Central',
  north: 'North',
};

const render = (listings) => {
  if (!container) return;
  container.innerHTML = '';

  listings.forEach((listing) => {
    const entry = {
      ...listing,
      regionLabel: regionLabels[listing.region] || 'Area',
    };
    container.appendChild(renderCard(entry));
  });
};

const init = async () => {
  if (!container) return;
  const category = container.dataset.category;

  try {
    const response = await fetch('/data.json');
    const data = await response.json();
    const listings = data.listings.filter((item) => item.category === category);
    render(listings);
  } catch (error) {
    container.innerHTML = '<p class="muted">Unable to load listings right now.</p>';
  }
};

init();
