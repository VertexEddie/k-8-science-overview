(() => {
  const months = ['2026-09', '2026-10', '2026-11', '2026-12'];
  const monthTitle = key => {
    const [year, month] = key.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  const label = date => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const localMonthKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;

  function installCalendarMonths() {
    const heading = document.querySelector('.schedule-heading');
    const calendar = document.querySelector('.schedule-days.real-calendar');
    if (!heading || !calendar || heading.querySelector('.calendar-month-nav')) return;
    const oldTitle = heading.querySelector('h2');
    const monthNav = document.createElement('div');
    monthNav.className = 'calendar-month-nav';
    monthNav.setAttribute('aria-label', 'Calendar month navigation');
    const previous = document.createElement('button');
    previous.type = 'button';
    previous.setAttribute('aria-label', 'Previous month');
    previous.innerHTML = '<span class="material-symbols-outlined">chevron_left</span>';
    const title = document.createElement('h2');
    title.setAttribute('aria-live', 'polite');
    const next = document.createElement('button');
    next.type = 'button';
    next.setAttribute('aria-label', 'Next month');
    next.innerHTML = '<span class="material-symbols-outlined">chevron_right</span>';
    const todayButton = document.createElement('button');
    todayButton.type = 'button';
    todayButton.className = 'calendar-today-button';
    todayButton.textContent = 'Today';
    monthNav.append(previous, title, next, todayButton);
    if (oldTitle) oldTitle.replaceWith(monthNav);
    else heading.prepend(monthNav);
    const instructions = heading.querySelector('.schedule-key');
    if (instructions) instructions.textContent = 'Use the arrows to move month by month, or scroll through nearby weeks.';

    let activeMonth = months.includes(localMonthKey(new Date())) ? localMonthKey(new Date()) : months[0];
    const dayFor = date => [...calendar.querySelectorAll('.schedule-day')].find(cell => cell.querySelector('time')?.textContent.trim() === label(date));
    const scrollTo = date => {
      const cell = dayFor(date);
      if (!cell) return;
      const top = cell.getBoundingClientRect().top - calendar.getBoundingClientRect().top + calendar.scrollTop;
      calendar.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    };
    const updateControls = () => {
      title.textContent = monthTitle(activeMonth);
      const index = months.indexOf(activeMonth);
      previous.disabled = index <= 0;
      next.disabled = index >= months.length - 1;
    };
    const goMonth = offset => {
      const index = months.indexOf(activeMonth) + offset;
      if (index < 0 || index >= months.length) return;
      activeMonth = months[index];
      updateControls();
      const [year, month] = activeMonth.split('-').map(Number);
      const first = new Date(year, month - 1, 1);
      while (first.getDay() === 0 || first.getDay() === 6) first.setDate(first.getDate() + 1);
      scrollTo(first);
    };
    previous.addEventListener('click', () => goMonth(-1));
    next.addEventListener('click', () => goMonth(1));
    todayButton.addEventListener('click', () => {
      const today = new Date();
      const key = localMonthKey(today);
      activeMonth = months.includes(key) ? key : months[months.length - 1];
      updateControls();
      const cell = dayFor(today);
      if (cell) { cell.click(); scrollTo(today); }
    });
    let frame = 0;
    calendar.addEventListener('scroll', () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = calendar.getBoundingClientRect();
        const center = bounds.top + bounds.height / 2;
        const centered = [...calendar.querySelectorAll('.schedule-day')].find(cell => cell.getBoundingClientRect().top <= center && cell.getBoundingClientRect().bottom >= center);
        const dateText = centered?.querySelector('time')?.textContent.trim();
        if (dateText) {
          const date = new Date(`${dateText} 2026`);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (months.includes(key) && key !== activeMonth) { activeMonth = key; updateControls(); }
        }
      });
    }, { passive: true });
    updateControls();
  }

  function installGrade6Modules(main) {
    const sidebar = main.querySelector('.course-nav');
    if (!sidebar || sidebar.querySelector('.module-quarter-disclosures')) return;
    const source = sidebar.querySelector('.module-index');
    const select = source?.querySelector('select');
    if (!select) return;
    const nav = document.createElement('nav');
    nav.className = 'course-nav-links';
    nav.setAttribute('aria-label', 'Grade 6 course modules');
    const groups = document.createElement('div');
    groups.className = 'quarter-disclosures module-quarter-disclosures';
    const label = document.createElement('span');
    label.className = 'nav-section';
    label.textContent = 'Course modules';
    groups.append(label);
    [...select.querySelectorAll('optgroup')].forEach((group, index) => {
      const section = document.createElement('section');
      section.className = 'quarter-disclosure';
      const panelId = `g6-module-list-${index + 1}`;
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'quarter-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', panelId);
      const quarterName = document.createElement('span');
      quarterName.textContent = group.label;
      const arrow = document.createElement('span');
      arrow.className = 'material-symbols-outlined quarter-chevron';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = 'expand_more';
      toggle.append(quarterName, arrow);
      const panel = document.createElement('div');
      panel.className = 'quarter-panel';
      panel.id = panelId;
      panel.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('div');
      inner.className = 'quarter-panel-inner';
      const list = document.createElement('div');
      list.className = 'quarter-topic-list';
      [...group.querySelectorAll('option')].forEach(option => {
        const link = document.createElement('a');
        link.className = 'quarter-topic module-topic';
        link.href = `#${option.value}`;
        link.tabIndex = -1;
        const match = option.textContent.trim().match(/^M(\d+)\s*·\s*(.*)$/u);
        const copy = document.createElement('span');
        copy.className = 'module-topic-copy';
        const number = document.createElement('strong');
        number.textContent = match ? `Module ${match[1]}` : 'Module';
        const title = document.createElement('span');
        title.className = 'module-topic-title';
        title.textContent = match ? match[2] : option.textContent.trim();
        copy.append(number, title);
        link.append(copy);
        list.append(link);
      });
      inner.append(list);
      panel.append(inner);
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        if (open && window.matchMedia('(max-width: 900px)').matches) {
          groups.querySelectorAll('.quarter-toggle[aria-expanded="true"]').forEach(other => {
            other.setAttribute('aria-expanded', 'false');
            other.closest('.quarter-disclosure')?.classList.remove('is-open');
            const otherPanel = document.getElementById(other.getAttribute('aria-controls'));
            if (otherPanel) {
              otherPanel.setAttribute('aria-hidden', 'true');
              otherPanel.querySelectorAll('a').forEach(link => { link.tabIndex = -1; });
            }
          });
        }
        toggle.setAttribute('aria-expanded', String(open));
        section.classList.toggle('is-open', open);
        panel.setAttribute('aria-hidden', String(!open));
        panel.querySelectorAll('a').forEach(link => { link.tabIndex = open ? 0 : -1; });
      });
      section.append(toggle, panel);
      groups.append(section);
    });
    nav.append(groups);
    source.replaceWith(nav);
  }

  function installGrade7and8Modules(main) {
    const sidebar = main.querySelector('.course-nav');
    if (!sidebar || sidebar.querySelector('.module-quarter-disclosures')) return;
    const isSeven = main.classList.contains('g7');
    const grade = isSeven ? 'g7' : 'g8';
    const quarters = [...main.querySelectorAll('.map-content > .quarter')];
    if (!quarters.length) return;
    const nav = document.createElement('nav');
    nav.className = 'course-nav-links';
    nav.setAttribute('aria-label', `Grade ${isSeven ? 7 : 8} course modules`);
    const groups = document.createElement('div');
    groups.className = 'quarter-disclosures module-quarter-disclosures';
    const label = document.createElement('span');
    label.className = 'nav-section';
    label.textContent = 'Course modules';
    groups.append(label);
    let number = 0;
    quarters.forEach((quarter, quarterIndex) => {
      const section = document.createElement('section');
      section.className = 'quarter-disclosure';
      const panelId = `${grade}-module-list-${quarterIndex + 1}`;
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'quarter-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', panelId);
      const quarterName = document.createElement('span');
      quarterName.textContent = quarter.querySelector('.sheet > header span')?.textContent.trim() || `Quarter ${quarterIndex + 1}`;
      const arrow = document.createElement('span');
      arrow.className = 'material-symbols-outlined quarter-chevron';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = 'expand_more';
      toggle.append(quarterName, arrow);
      const panel = document.createElement('div');
      panel.className = 'quarter-panel';
      panel.id = panelId;
      panel.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('div');
      inner.className = 'quarter-panel-inner';
      const list = document.createElement('div');
      list.className = 'quarter-topic-list';
      const cards = [...quarter.querySelectorAll(isSeven ? '.g7-lesson' : '.assignment-lesson, .folder-lesson')];
      cards.forEach(card => {
        number += 1;
        card.id = `${grade}m${number}`;
        const rawTitle = (isSeven ? card.querySelector('.g6-lesson-title span:first-child') : card.querySelector('.lesson-heading a'))?.textContent.trim() || `Module ${number}`;
        const titleText = rawTitle.includes('|') ? rawTitle.split('|').pop().trim() : rawTitle;
        const link = document.createElement('a');
        link.className = 'quarter-topic module-topic';
        link.href = `#${card.id}`;
        link.tabIndex = -1;
        const copy = document.createElement('span');
        copy.className = 'module-topic-copy';
        const module = document.createElement('strong');
        module.textContent = `Module ${number}`;
        const title = document.createElement('span');
        title.className = 'module-topic-title';
        title.textContent = titleText;
        copy.append(module, title);
        link.append(copy);
        list.append(link);
      });
      inner.append(list);
      panel.append(inner);
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        if (open && window.matchMedia('(max-width: 900px)').matches) {
          groups.querySelectorAll('.quarter-toggle[aria-expanded="true"]').forEach(other => {
            other.setAttribute('aria-expanded', 'false');
            other.closest('.quarter-disclosure')?.classList.remove('is-open');
            const otherPanel = document.getElementById(other.getAttribute('aria-controls'));
            if (otherPanel) { otherPanel.setAttribute('aria-hidden', 'true'); otherPanel.querySelectorAll('a').forEach(link => { link.tabIndex = -1; }); }
          });
        }
        toggle.setAttribute('aria-expanded', String(open));
        section.classList.toggle('is-open', open);
        panel.setAttribute('aria-hidden', String(!open));
        panel.querySelectorAll('a').forEach(link => { link.tabIndex = open ? 0 : -1; });
      });
      section.append(toggle, panel);
      groups.append(section);
    });
    nav.append(groups);
    const oldNav = sidebar.querySelector('.course-nav-links');
    if (oldNav) oldNav.replaceWith(nav);
    else sidebar.append(nav);
  }

  function installCourseLayouts() {
    const main = document.querySelector('.course-layout.g6:not(.calendar-layout), .course-layout.g7, .course-layout.g8, #g8.course-layout');
    if (!main) return;
    const sidebar = main.querySelector('.course-nav');
    const content = main.querySelector('.map-content');
    if (!sidebar || !content) return;
    const isGrade6 = main.classList.contains('g6');
    if (isGrade6) installGrade6Modules(main);
    else installGrade7and8Modules(main);
    const masthead = content.querySelector(':scope > .masthead');
    const resources = masthead?.querySelector('.grade-resources');
    let filterMenu = masthead?.querySelector('.g6-filter-menu');
    if (!filterMenu && !isGrade6) {
      const filter = masthead?.querySelector('.course-filter');
      if (filter) {
        filterMenu = document.createElement('details');
        filterMenu.className = 'g6-filter-menu';
        const summary = document.createElement('summary');
        summary.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">tune</span><span>Filters</span><span class="material-symbols-outlined filter-chevron" aria-hidden="true">expand_more</span>';
        filterMenu.append(summary, filter);
      }
    }
    if (resources && !sidebar.contains(resources)) {
      resources.querySelectorAll('a').forEach(link => {
        if (!link.textContent.toLowerCase().includes('reteach')) return;
        const icon = link.querySelector('.material-symbols-outlined');
        link.replaceChildren(...(icon ? [icon] : []), document.createTextNode('Reteach & Review'));
      });
      const moduleNav = sidebar.querySelector('.course-nav-links, .module-quarter-disclosures');
      sidebar.insertBefore(resources, moduleNav || null);
    }
    if (filterMenu && !content.querySelector(':scope > .g6-filter-row')) {
      const row = document.createElement('div');
      row.className = 'g6-filter-row';
      row.append(filterMenu);
      const firstQuarter = content.querySelector(':scope > .quarter');
      content.insertBefore(row, firstQuarter || null);
    }
    if (filterMenu && filterMenu.parentElement === masthead) filterMenu.remove();
    masthead?.remove();
  }

  const resourceLabels = { schedule: 'Development Schedule', pacing: 'Pacing Guide', directory: 'Schoology Directory', reteach: 'Reteach & Review' };
  const readScheduleRoute = () => {
    const query = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const requestedGrade = query.get('grade');
    return { grade: ['6','7','8'].includes(requestedGrade) ? requestedGrade : '7', view: Object.hasOwn(resourceLabels, query.get('view')) ? query.get('view') : 'schedule', module: query.get('module') };
  };
  const scheduleResourceHref = (grade, view, module) => `#all-grades-calendar?grade=${grade}&view=${view}${module ? `&module=${module}` : ''}`;

  function installIntegratedResourceLinks() {
    const course = document.querySelector('.course-layout.g6:not(.calendar-layout), .course-layout.g7:not(.calendar-layout), .course-layout.g8:not(.calendar-layout), #g8.course-layout:not(.calendar-layout)');
    const resources = course?.querySelector('.course-nav .grade-resources');
    if (!course || !resources) return;
    const grade = course.classList.contains('g6') ? '6' : course.classList.contains('g7') ? '7' : '8';
    resources.querySelectorAll('a').forEach(link => {
      const label = link.textContent.trim().toLowerCase();
      const view = label.includes('development schedule') ? 'schedule' : label.includes('pacing guide') ? 'pacing' : label.includes('schoology directory') ? 'directory' : label.includes('reteach') ? 'reteach' : null;
      if (!view) return;
      link.href = scheduleResourceHref(view === 'schedule' ? '7' : grade, view);
      link.removeAttribute('target');
      link.removeAttribute('rel');
      link.classList.remove('is-active');
      link.removeAttribute('aria-current');
    });
  }

  function makeScheduleGradePicker(grade) {
    const picker = document.createElement('div');
    picker.className = 'grade-picker is-current';
    picker.setAttribute('role', 'tablist');
    picker.setAttribute('aria-label', 'Science course grades');
    const label = document.createElement('p');
    label.className = 'grade-picker-label';
    label.textContent = 'Grades 6–8';
    const buttons = document.createElement('div');
    buttons.className = 'grade-buttons';
    buttons.setAttribute('role', 'tablist');
    buttons.setAttribute('aria-label', 'Science course grades');
    ['6','7','8'].forEach(value => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', String(value === grade));
      button.textContent = `Grade ${value}`;
      button.addEventListener('click', () => { window.location.hash = scheduleResourceHref(value, readScheduleRoute().view); });
      buttons.append(button);
    });
    picker.append(label, buttons);
    return picker;
  }

  function makeScheduleResourceNav(grade, view) {
    const nav = document.createElement('nav');
    nav.className = 'grade-resources';
    nav.setAttribute('aria-label', 'Grade resources');
    [['schedule','calendar_month'],['pacing','event_note'],['directory','folder_open'],['reteach','co_present']].forEach(([key, icon]) => {
      const link = document.createElement('a');
      link.href = scheduleResourceHref(grade, key);
      link.className = key === view ? 'is-active' : '';
      if (key === view) link.setAttribute('aria-current', 'page');
      const symbol = document.createElement('span');
      symbol.className = 'material-symbols-outlined';
      symbol.setAttribute('aria-hidden', 'true');
      symbol.textContent = icon;
      link.append(symbol, document.createTextNode(resourceLabels[key]));
      nav.append(link);
    });
    return nav;
  }

  function makeScheduleModuleNav(main, grade) {
    const rows = [...main.querySelectorAll('.completion-table .completion-row:not(.completion-header)')].filter(row => row.classList.contains(`grade-${grade}`));
    if (!rows.length) return null;
    const nav = document.createElement('nav');
    nav.className = 'course-nav-links';
    nav.setAttribute('aria-label', `Grade ${grade} course modules`);
    const groups = document.createElement('div');
    groups.className = 'quarter-disclosures module-quarter-disclosures';
    const heading = document.createElement('span');
    heading.className = 'nav-section';
    heading.textContent = 'Course modules';
    groups.append(heading);
    ['1','2','3','4'].forEach(quarter => {
      const quarterRows = rows.filter(row => row.classList.contains(`q${quarter}`));
      if (!quarterRows.length) return;
      const section = document.createElement('section');
      section.className = 'quarter-disclosure';
      const panelId = `schedule-grade-${grade}-q${quarter}-modules`;
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'quarter-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', panelId);
      const title = document.createElement('span');
      title.textContent = `Quarter ${quarter}`;
      const arrow = document.createElement('span');
      arrow.className = 'material-symbols-outlined quarter-chevron';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = 'expand_more';
      toggle.append(title, arrow);
      const panel = document.createElement('div');
      panel.className = 'quarter-panel';
      panel.id = panelId;
      panel.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('div');
      inner.className = 'quarter-panel-inner';
      const list = document.createElement('div');
      list.className = 'quarter-topic-list';
      const seen = new Set();
      quarterRows.forEach(row => {
        const strong = row.querySelector('strong');
        const match = strong?.textContent.match(/\bM(\d+)\b/);
        if (!match || seen.has(match[1])) return;
        seen.add(match[1]);
        const link = document.createElement('a');
        link.className = 'quarter-topic module-topic';
        link.href = scheduleResourceHref(grade, 'schedule', match[1]);
        const copy = document.createElement('span');
        copy.className = 'module-topic-copy';
        const number = document.createElement('strong');
        number.textContent = `Module ${match[1]}`;
        const name = document.createElement('span');
        name.className = 'module-topic-title';
        name.textContent = row.querySelector('span:nth-child(2)')?.textContent.trim() || `Module ${match[1]}`;
        copy.append(number, name);
        link.append(copy);
        list.append(link);
      });
      inner.append(list);
      panel.append(inner);
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(open));
        section.classList.toggle('is-open', open);
        panel.setAttribute('aria-hidden', String(!open));
        panel.querySelectorAll('a').forEach(link => { link.tabIndex = open ? 0 : -1; });
      });
      panel.querySelectorAll('a').forEach(link => { link.tabIndex = -1; });
      section.append(toggle, panel);
      groups.append(section);
    });
    nav.append(groups);
    return nav;
  }

  function installScheduleWorkspace() {
    const main = document.querySelector('.all-schedule-layout');
    const sidebar = main?.querySelector('.schedule-nav');
    const content = main?.querySelector('.calendar-content');
    if (!main || !sidebar || !content) return;
    const route = readScheduleRoute();
    const activeNavKey = `${route.grade}:${route.view}`;
    if (sidebar.dataset.workspaceKey !== activeNavKey) {
      sidebar.replaceChildren(makeScheduleGradePicker(route.grade), makeScheduleResourceNav(route.grade, route.view));
      const moduleNav = makeScheduleModuleNav(main, route.grade);
      if (moduleNav) sidebar.append(moduleNav);
      sidebar.dataset.workspaceKey = activeNavKey;
    }
    main.querySelector('.schedule-masthead .grade-resources')?.remove();
    const scheduleParts = ['.schedule-masthead','.schedule-status-row','.schedule-tools','.schedule-admin','.schedule-timeline','.completion-list'];
    scheduleParts.forEach(selector => { const element = main.querySelector(selector); if (element) element.hidden = route.view !== 'schedule'; });
    let resourcePage = content.querySelector('.resource-view-content');
    if (route.view === 'schedule') {
      resourcePage?.remove();
      const moduleNumber = route.module;
      if (moduleNumber && main.dataset.selectedModuleRoute !== `${route.grade}:${moduleNumber}`) {
        const row = [...main.querySelectorAll(`.completion-table .completion-row.grade-${route.grade}`)].find(item => new RegExp(`\\bM${moduleNumber}\\b`).test(item.querySelector('strong')?.textContent || ''));
        const date = row?.querySelector('time')?.textContent.trim();
        const day = date && [...main.querySelectorAll('.schedule-day')].find(item => item.querySelector('time')?.textContent.trim() === date);
        if (day) { day.click(); day.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
        main.dataset.selectedModuleRoute = `${route.grade}:${moduleNumber}`;
      }
      return;
    }
    main.dataset.selectedModuleRoute = '';
    if (!resourcePage) {
      resourcePage = document.createElement('section');
      resourcePage.className = 'resource-view-content';
      content.prepend(resourcePage);
    }
    const resourceKey = `${route.grade}:${route.view}`;
    if (resourcePage.dataset.resourceKey === resourceKey) return;
    resourcePage.dataset.resourceKey = resourceKey;
    const urls = {
      pacing: `https://docs.google.com/spreadsheets/d/1u6pRTJXXx3qgLb7qBQ6iXDo6XjYNA0kCdXw_U8dNrag/preview?gid=${({6:'84160990',7:'934147095',8:'1937787038'})[route.grade]}&rm=minimal`,
      directory: `https://legacyaz.schoology.com/course/7836596606/materials?f=${({6:'1040451133',7:'1040451441',8:'1040758396'})[route.grade]}`,
      reteach: `https://legacyaz.schoology.com/page/${({6:'8559988197',7:'8559989915',8:'8562135902'})[route.grade]}`
    };
    resourcePage.replaceChildren();
    const heading = document.createElement('header');
    heading.className = 'resource-page-heading';
    const eyebrow = document.createElement('p');
    eyebrow.className = 'calendar-eyebrow';
    eyebrow.textContent = `Grade ${route.grade} resource`;
    const title = document.createElement('h1');
    title.textContent = resourceLabels[route.view];
    heading.append(eyebrow, title);
    const frameWrap = document.createElement('div');
    frameWrap.className = 'embedded-resource';
    const fallback = document.createElement('a');
    fallback.href = urls[route.view];
    fallback.target = '_blank';
    fallback.rel = 'noreferrer';
    if (route.view === 'pacing') {
      const frame = document.createElement('iframe');
      frame.title = `Grade ${route.grade} ${resourceLabels[route.view]}`;
      frame.loading = 'lazy';
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.src = urls[route.view];
      fallback.textContent = 'Open Pacing Guide in a new tab';
      frameWrap.append(frame, fallback);
    } else {
      const card = document.createElement('div');
      card.className = 'schoology-resource-card';
      const icon = document.createElement('span');
      icon.className = 'material-symbols-outlined';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = 'open_in_new';
      const copy = document.createElement('div');
      const cardTitle = document.createElement('strong');
      cardTitle.textContent = `${resourceLabels[route.view]} opens in Schoology`;
      const note = document.createElement('p');
      note.textContent = 'Schoology does not allow this page to be embedded here. This link opens the selected grade resource.';
      fallback.textContent = 'Open in Schoology';
      copy.append(cardTitle, note);
      card.append(icon, copy, fallback);
      frameWrap.append(card);
    }
    resourcePage.append(heading, frameWrap);
  }

  function installScheduleDefaults() {
    const main = document.querySelector('.all-schedule-layout');
    if (!main || readScheduleRoute().view !== 'schedule') return;
    const switcher = main.querySelector('.schedule-switcher');
    if (switcher && main.dataset.defaultGradeViewApplied !== 'true') {
      const allGrades = [...switcher.querySelectorAll('button')].find(button => button.textContent.trim().toLowerCase() === 'all grades');
      if (!allGrades) return;
      if (allGrades.getAttribute('aria-pressed') !== 'true') allGrades.click();
      main.dataset.defaultGradeViewApplied = 'true';
    }
    const calendar = main.querySelector('.schedule-days.real-calendar');
    const today = calendar?.querySelector('.schedule-day.is-current');
    if (!calendar || !today || calendar.dataset.currentDatePositioned === 'true') return;
    calendar.dataset.currentDatePositioned = 'pending';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!calendar.isConnected || !today.isConnected) return;
      const top = today.getBoundingClientRect().top - calendar.getBoundingClientRect().top + calendar.scrollTop;
      calendar.scrollTop = Math.max(0, top);
      calendar.dataset.currentDatePositioned = 'true';
    }));
  }

  const observer = new MutationObserver(() => {
    installCalendarMonths();
    installCourseLayouts();
    installIntegratedResourceLinks();
    installScheduleWorkspace();
    installScheduleDefaults();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  installCalendarMonths();
  installCourseLayouts();
  installIntegratedResourceLinks();
  installScheduleWorkspace();
  installScheduleDefaults();
  window.addEventListener('hashchange', () => { installIntegratedResourceLinks(); installScheduleWorkspace(); installScheduleDefaults(); });
})();

