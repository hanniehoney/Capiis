import { getProfile } from '../utils/api.js';

export async function renderProfile(container) {
  container.innerHTML = `<div class="loading-state"><div class="hex-spinner"></div><p>Loading profile...</p></div>`;

  try {
    const profile = await getProfile();

    container.innerHTML = `
      <div class="view-container">
        <!-- Managed Banner -->
        <div class="profile-managed-banner animate-in stagger-1">
          <span class="managed-icon">\u2699</span>
          <div>
            <div class="managed-title">Managed by Claude Code</div>
            <div class="managed-subtitle">Profile data is managed through conversation, not dashboard editing. Tell Claude Code to update your profile.</div>
          </div>
        </div>

        <!-- Personal Info -->
        <div class="card animate-in stagger-2" style="margin-bottom:20px">
          <div class="card-header">
            <span class="card-title">Personal Info</span>
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
        <div class="card animate-in stagger-3" style="margin-bottom:20px">
          <div class="card-header">
            <span class="card-title">Location & Tax</span>
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
          ${profile.tax.notes ? `<div class="profile-notes">${profile.tax.notes}</div>` : ''}
        </div>

        <!-- Accounts -->
        <div class="card animate-in stagger-4">
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
  } catch (e) {
    container.innerHTML = `
      <div class="view-container">
        <div class="empty-state">
          <div class="empty-icon">\u2699</div>
          <p>No profile configured</p>
          <p style="font-size:0.85rem;color:var(--text-tertiary);margin-top:8px">
            Set up your profile by telling Claude Code:<br>
            <code style="font-family:var(--font-mono);color:var(--gold-primary)">"Set up my Capis profile"</code>
          </p>
        </div>
      </div>
    `;
  }
}

function renderField(label, value) {
  return `
    <div class="profile-field">
      <div class="profile-field-label">${label}</div>
      <div class="profile-field-value">${value || '\u2014'}</div>
    </div>
  `;
}

function renderAccountRow(acct) {
  const treatment = getAccountTaxTreatment(acct.type);
  const badgeClass = treatment.class;
  return `
    <tr>
      <td><strong>${acct.name}</strong></td>
      <td class="mono" style="font-size:0.82rem">${acct.type}</td>
      <td>${acct.institution}</td>
      <td><span class="account-type-badge ${badgeClass}">${treatment.label}</span></td>
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
