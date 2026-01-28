const categoryLabels = {
  'local-eats': 'Local Eats',
  'us-favorites': 'US Favorites',
  beach: 'Beach',
  hike: 'Hike',
  ocean: 'Ocean Activities',
  bar: 'Bar',
  shopping: 'Shopping',
  golf: 'Golf',
};

const regionLabels = {
  south: 'South',
  central: 'Central',
  north: 'North',
};

const formatDate = (value) => {
  if (!value) return 'Unverified';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${month}/${day}/${year}`;
};

const setText = (id, text) => {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
};

const clearChildren = (el) => {
  while (el && el.firstChild) {
    el.removeChild(el.firstChild);
  }
};

const renderListing = (listing) => {
  document.title = `${listing.name} | OkiUS Atlas`;
  setText('breadcrumb-listing', listing.name);
  setText('listing-name', listing.name);
  setText('listing-summary', listing.summary || 'Admin-curated listing.');

  const categoryLabel = categoryLabels[listing.category] || listing.category || 'Category';
  const regionLabel = regionLabels[listing.region] || listing.region || 'Area';

  const breadcrumbCategoryLink = document.getElementById('breadcrumb-category-link');
  if (breadcrumbCategoryLink) {
    breadcrumbCategoryLink.textContent = categoryLabel;
    if (listing.category) {
      breadcrumbCategoryLink.setAttribute('href', `/category-${listing.category}.html`);
    }
  }

  const chips = document.getElementById('listing-chips');
  clearChildren(chips);
  if (chips) {
    const chipList = [categoryLabel, regionLabel].concat(listing.tags || []);
    chipList.forEach((label) => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = label;
      chips.appendChild(chip);
    });
  }

  const overview = listing.summary
    ? `${listing.summary} This listing is curated for Americans living on Okinawa Main Island.`
    : 'Admin-curated listing for Americans living on Okinawa Main Island.';
  setText('listing-overview', overview);
  setText('listing-note', listing.notes || 'Admin-curated. Verify details before visiting.');

  const highlights = document.getElementById('listing-highlights');
  clearChildren(highlights);
  const highlightItems = listing.tags && listing.tags.length ? listing.tags : ['Admin curated', 'Verify details before visiting'];
  highlightItems.forEach((tag) => {
    const li = document.createElement('li');
    li.textContent = tag;
    highlights && highlights.appendChild(li);
  });

  const quickFacts = document.getElementById('quick-facts');
  clearChildren(quickFacts);
  if (quickFacts) {
    const facts = [
      ['Area', listing.area],
      ['Category', categoryLabel],
      ['Region', regionLabel],
      ['Hours', listing.hours],
      ['Price', listing.price],
      ['English', listing.english],
      ['Parking', listing.parking],
      ['Phone', listing.phone],
      ['Verified', formatDate(listing.lastVerified)],
    ];
    if (listing.status) {
      facts.splice(3, 0, ['Status', listing.status]);
    }
    facts.forEach(([label, value]) => {
      if (!value) return;
      const span = document.createElement('span');
      span.textContent = `${label}: ${value}`;
      quickFacts.appendChild(span);
    });
  }

  const mapLink = document.getElementById('map-link');
  if (mapLink) {
    const query = listing.mapQuery || `${listing.name} ${listing.area || ''} Okinawa`;
    mapLink.setAttribute(
      'href',
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    );
  }

  const goodFor = document.getElementById('good-for');
  clearChildren(goodFor);
  if (goodFor) {
    const tags = listing.tags && listing.tags.length ? listing.tags : ['Local favorite'];
    tags.forEach((tag) => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = tag;
      goodFor.appendChild(chip);
    });
  }

  const logContainer = document.getElementById('verification-log');
  clearChildren(logContainer);
  if (logContainer) {
    const logs = listing.verificationLog && listing.verificationLog.length ? listing.verificationLog : [];
    if (!logs.length) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = 'No verification history yet.';
      logContainer.appendChild(empty);
      return;
    }
    logs.forEach((log) => {
      const card = document.createElement('article');
      card.className = 'category-card';

      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = formatDate(log.date);

      const name = document.createElement('h3');
      name.textContent = log.by || 'Admin';

      const note = document.createElement('p');
      note.className = 'muted';
      note.textContent = log.note || 'Update logged.';

      card.append(badge, name, note);
      logContainer.appendChild(card);
    });
  }
};

const renderNav = (listing, listings) => {
  const nav = document.getElementById('listing-nav');
  if (!nav) return;
  clearChildren(nav);

  const currentIndex = listings.findIndex((item) => item.id === listing.id);
  const prev = currentIndex > 0 ? listings[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < listings.length - 1 ? listings[currentIndex + 1] : null;

  const makeListingLink = (label, item) => {
    if (!item) {
      const disabled = document.createElement('span');
      disabled.className = 'filter-btn is-disabled';
      disabled.textContent = label;
      return disabled;
    }
    const link = document.createElement('a');
    link.className = 'filter-btn is-active';
    link.textContent = label;
    link.setAttribute('href', `/listing.html?id=${item.id}`);
    return link;
  };

  const backLink = document.createElement('a');
  backLink.className = 'filter-btn';
  backLink.textContent = 'Back to directory';
  backLink.setAttribute('href', '/index.html#directory');

  nav.appendChild(makeListingLink('Previous', prev));
  nav.appendChild(backLink);
  nav.appendChild(makeListingLink('Next', next));
};

const renderRelated = (listing, listings) => {
  const container = document.getElementById('related-grid');
  if (!container) return;
  clearChildren(container);

  const candidates = listings.filter((item) => item.id !== listing.id);
  const related = candidates
    .filter((item) => item.category === listing.category || item.region === listing.region)
    .slice(0, 3);

  if (!related.length) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'No related listings yet.';
    container.appendChild(empty);
    return;
  }

  related.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'category-card';

    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = categoryLabels[item.category] || 'Listing';

    const title = document.createElement('h3');
    title.textContent = item.name;

    const summary = document.createElement('p');
    summary.className = 'muted';
    summary.textContent = item.summary || '';

    const link = document.createElement('a');
    link.className = 'btn small';
    link.textContent = 'View details';
    link.setAttribute('href', `/listing.html?id=${item.id}`);

    article.append(badge, title, summary, link);
    container.appendChild(article);
  });
};

const renderNotFound = () => {
  document.title = 'Listing not found | OkiUS Atlas';
  setText('breadcrumb-listing', 'Not found');
  setText('listing-name', 'Listing not found');
  setText('listing-summary', 'We could not find that listing. Please return to the directory.');
  setText('listing-overview', 'This listing may have been removed or renamed.');
  setText('listing-note', 'Check the directory for the latest listings.');
  const chips = document.getElementById('listing-chips');
  clearChildren(chips);
};

const init = async () => {
  const params = new URLSearchParams(window.location.search);
  const listingId = params.get('id');

  if (!listingId) {
    renderNotFound();
    return;
  }

  try {
    const response = await fetch('/data.json');
    const data = await response.json();
    const listing = data.listings.find((item) => item.id === listingId);
    if (!listing) {
      renderNotFound();
      return;
    }
    renderListing(listing);
    renderRelated(listing, data.listings);
    renderNav(listing, data.listings);
  } catch (error) {
    renderNotFound();
  }
};

init();
