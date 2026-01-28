const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
const searchInput = document.getElementById('search');
const countEl = document.getElementById('listing-count');
const grid = document.getElementById('listing-grid');

const state = {
  filters: new Set(['all']),
  search: '',
  listings: [],
};

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

const getLastLog = (listing) => {
  const logs = listing.verificationLog || [];
  if (!logs.length) return null;
  return logs[0];
};

const createCard = (listing) => {
  const article = document.createElement('article');
  article.className = 'card';
  article.dataset.tags = `${listing.category} ${listing.region}`;
  article.dataset.name = `${listing.name} ${listing.area}`;

  const top = document.createElement('div');
  top.className = 'card-top';

  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = categoryLabels[listing.category] || 'Listing';

  const region = document.createElement('span');
  region.className = 'tag';
  region.textContent = regionLabels[listing.region] || listing.region;

  top.append(badge, region);

  const title = document.createElement('h3');
  title.textContent = listing.name;

  const summary = document.createElement('p');
  summary.className = 'muted';
  summary.textContent = listing.summary;

  const meta = document.createElement('div');
  meta.className = 'card-meta';
  const area = document.createElement('span');
  area.textContent = `Area: ${listing.area}`;
  const verified = document.createElement('span');
  verified.textContent = `Verified: ${formatDate(listing.lastVerified)}`;
  meta.append(area, verified);
  if (listing.status) {
    const status = document.createElement('span');
    status.textContent = `Status: ${listing.status}`;
    meta.appendChild(status);
  }

  const log = getLastLog(listing);
  if (log) {
    const logSpan = document.createElement('span');
    const by = log.by || 'Admin';
    logSpan.textContent = `Last update: ${formatDate(log.date)} by ${by}`;
    meta.appendChild(logSpan);
  }

  const chips = document.createElement('div');
  chips.className = 'chip-row';
  listing.tags.forEach((tag) => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = tag;
    chips.appendChild(chip);
  });

  const link = document.createElement('a');
  link.className = 'btn ghost small';
  link.textContent = 'View details';
  const detailHref = listing.id ? `/listing.html?id=${listing.id}` : (listing.link || '#');
  link.setAttribute('href', detailHref);

  article.append(top, title, summary, meta, chips, link);
  return article;
};

const updateCount = (visibleCards) => {
  if (countEl) {
    countEl.textContent = String(visibleCards.length);
  }
};

const matchesFilters = (card) => {
  const tags = card.dataset.tags.split(' ');
  const activeFilters = Array.from(state.filters);
  const hasAll = activeFilters.includes('all');
  const matchesFilter = hasAll || activeFilters.some((filter) => tags.includes(filter));

  const term = state.search.toLowerCase();
  const name = card.dataset.name.toLowerCase();
  const text = card.textContent.toLowerCase();
  const matchesSearch = term.length === 0 || name.includes(term) || text.includes(term);

  return matchesFilter && matchesSearch;
};

const renderCards = () => {
  if (!grid) return;
  grid.innerHTML = '';
  state.listings.forEach((listing) => {
    grid.appendChild(createCard(listing));
  });
};

const applyFilters = () => {
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.card'));
  const visibleCards = [];
  cards.forEach((card) => {
    const visible = matchesFilters(card);
    card.style.display = visible ? 'grid' : 'none';
    if (visible) visibleCards.push(card);
  });
  updateCount(visibleCards);
};

const bindFilters = () => {
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      if (filter === 'all') {
        state.filters = new Set(['all']);
        filterButtons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.filter === 'all'));
      } else {
        state.filters.delete('all');
        if (state.filters.has(filter)) {
          state.filters.delete(filter);
          button.classList.remove('is-active');
        } else {
          state.filters.add(filter);
          button.classList.add('is-active');
        }
        const anyActive = state.filters.size > 0;
        if (!anyActive) {
          state.filters.add('all');
          filterButtons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.filter === 'all'));
        }
        const allButton = filterButtons.find((btn) => btn.dataset.filter === 'all');
        if (allButton) allButton.classList.remove('is-active');
      }

      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      state.search = event.target.value;
      applyFilters();
    });
  }
};

const init = async () => {
  if (!grid) return;

  try {
    const response = await fetch('/data.json');
    const data = await response.json();
    state.listings = data.listings;
  } catch (error) {
    grid.innerHTML = '<p class="muted">Unable to load listings right now.</p>';
    return;
  }

  renderCards();
  applyFilters();
  bindFilters();
};

init();
