import { getProfile } from '../utils/api.js';

export async function renderProfile(container) {
  container.innerHTML = `<div class="loading-state"><div class="hex-spinner"></div><p>Loading profile...</p></div>`;

  try {
    const profile = await getProfile();
    const managedTip = 'To update profile data, use conversation in Claude Code.';
    const taxTip = profile.tax && profile.tax.notes ? profile.tax.notes : '';

    container.innerHTML = `
      <div class="view-container">
        <!-- Personal Info -->
        <div class="card animate-in stagger-1" style="margin-bottom:20px">
          <div class="card-header">
            <div class="card-title-row">
              <span class="card-title">Personal Info</span>
              ${renderInfoTip(managedTip)}
            </div>
          </div>
          <div class="profile-grid">
            ${renderField('Name', profile.personal.name)}
            ${renderField('Title', profile.personal.title)}
            ${renderField('Occupation', profile.personal.occupation)}
            ${renderField('Company', profile.personal.company)}
            ${renderField('Experience', profile.personal.yearsOfExperience + ' years')}
          </div>
        </div>

        <!-- Location & Tax -->
        <div class="card animate-in stagger-2" style="margin-bottom:20px">
          <div class="card-header">
            <div class="card-title-row">
              <span class="card-title">Location & Tax</span>
              ${taxTip ? renderInfoTip(taxTip) : ''}
            </div>
          </div>
          <div class="profile-grid">
            ${renderField('Country', profile.location.country)}
            ${renderField('State', profile.location.state)}
            ${renderField('City', profile.location.city)}
            ${renderField('ZIP Code', profile.location.zipCode)}
            ${renderField('Filing Status', formatFilingStatus(profile.tax.filingStatus))}
            ${renderField('Dependents', String(profile.tax.dependents))}
            ${renderField('Federal Bracket', (profile.tax.federalTaxBracket * 100).toFixed(0) + '%')}
            ${renderField('State Tax Rate', (profile.tax.stateTaxRate * 100).toFixed(0) + '%')}
            ${renderField('LTCG Rate', (profile.tax.longTermCapitalGainsRate * 100).toFixed(1) + '%')}
            ${renderField('STCG Rate', (profile.tax.shortTermCapitalGainsRate * 100).toFixed(0) + '%')}
          </div>
        </div>

        <!-- Accounts -->
        <div class="card animate-in stagger-3">
          <div class="card-header">
            <span class="card-title">Accounts</span>
            <span style="font-size:0.78rem;color:var(--text-tertiary)">${profile.accounts.length} accounts</span>
          </div>
          <table class="asset-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Type</th>
                <th>Institution</th>
                <th>Tax Treatment</th>
              </tr>
            </thead>
            <tbody>
              ${profile.accounts.map(renderAccountRow).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    bindInfoTips(container);
  } catch (e) {
    container.innerHTML = `
      <div class="view-container">
        <div class="empty-state">
          <div class="empty-icon">\u2699</div>
          <p>No profile configured</p>
          <p style="font-size:0.85rem;color:var(--text-tertiary);margin-top:8px">
            Set up your profile by telling Claude Code:<br>
            <code style="font-family:var(--font-mono);color:var(--gold-primary)">"Set up my Capiis profile"</code>
          </p>
        </div>
      </div>
    `;
  }
}

function renderInfoTip(text) {
  const safe = escapeHTML(text);
  return `
    <span class="info-popover" data-info="${safe}">
      <button type="button" class="inline-info-tip" aria-label="Show info">i</button>
    </span>
  `;
}

function getGlobalInfoPanel() {
  let panel = document.getElementById('global-info-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'global-info-panel';
    panel.className = 'inline-info-panel';
    panel.setAttribute('role', 'note');
    document.body.appendChild(panel);
  }
  return panel;
}

function positionInfoPanel(text, button) {
  if (!button) return;
  const panel = getGlobalInfoPanel();
  panel.textContent = text || '';

  const padding = 12;
  const maxWidth = 520;
  const width = Math.min(maxWidth, window.innerWidth - padding * 2);

  panel.style.display = 'block';
  panel.style.width = `${width}px`;

  const buttonRect = button.getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();

  let left = buttonRect.left + (buttonRect.width / 2) - (width / 2);
  left = Math.max(padding, Math.min(left, window.innerWidth - width - padding));

  let top = buttonRect.bottom + 8;
  if (top + panelRect.height + padding > window.innerHeight) {
    top = Math.max(padding, buttonRect.top - panelRect.height - 8);
  }

  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;
}

function closeInfoPanel() {
  const panel = document.getElementById('global-info-panel');
  if (panel) {
    panel.style.display = 'none';
  }
}

function bindInfoTips(container) {
  if (container.dataset.infoTipsBound === 'true') {
    return;
  }
  container.dataset.infoTipsBound = 'true';

  container.addEventListener('click', (e) => {
    const popover = e.target.closest('.info-popover');
    const button = e.target.closest('.inline-info-tip');

    // Click outside any info popover closes all open panels.
    if (!popover) {
      container.querySelectorAll('.info-popover.open').forEach(p => p.classList.remove('open'));
      closeInfoPanel();
      return;
    }

    if (!button) {
      return;
    }

    const isOpen = popover.classList.contains('open');
    container.querySelectorAll('.info-popover.open').forEach(p => p.classList.remove('open'));
    if (isOpen) {
      closeInfoPanel();
      return;
    }

    const text = popover.dataset.info || '';
    positionInfoPanel(text, button);
    popover.classList.add('open');
  });
}

function escapeHTML(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderField(label, value) {
  return `
    <div class="profile-field">
      <div class="profile-field-label">${escapeHTML(label)}</div>
      <div class="profile-field-value">${escapeHTML(value || '\u2014')}</div>
    </div>
  `;
}

function renderAccountRow(acct) {
  const treatment = getAccountTaxTreatment(acct.type);
  const badgeClass = treatment.class;
  return `
    <tr>
      <td><strong>${escapeHTML(acct.name)}</strong></td>
      <td class="mono" style="font-size:0.82rem">${escapeHTML(acct.type)}</td>
      <td>${escapeHTML(acct.institution)}</td>
      <td><span class="account-type-badge ${badgeClass}">${escapeHTML(treatment.label)}</span></td>
    </tr>
  `;
}

function formatFilingStatus(status) {
  const map = {
    'single': 'Single',
    'married-joint': 'Married Filing Jointly',
    'married-separate': 'Married Filing Separately',
    'head-of-household': 'Head of Household'
  };
  return map[status] || status;
}

function getAccountTaxTreatment(type) {
  const treatments = {
    'taxable': { label: 'Taxable', class: 'taxable' },
    'traditional-ira': { label: 'Tax-Deferred', class: 'tax-deferred' },
    'roth-ira': { label: 'Tax-Exempt', class: 'tax-exempt' },
    'traditional-401k': { label: 'Tax-Deferred', class: 'tax-deferred' },
    'roth-401k': { label: 'Tax-Exempt', class: 'tax-exempt' },
    'hsa': { label: 'Triple Tax-Advantaged', class: 'tax-advantaged' },
    '529': { label: 'Tax-Advantaged', class: 'tax-advantaged' },
    'direct': { label: 'Varies', class: 'taxable' },
    'checking': { label: 'Taxable', class: 'taxable' },
    'savings': { label: 'Taxable', class: 'taxable' }
  };
  return treatments[type] || { label: 'Taxable', class: 'taxable' };
}
