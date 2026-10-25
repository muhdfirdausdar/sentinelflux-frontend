import { urlConstructor } from './services/urlConstructor';
import { FilterState } from './types/filters';

console.log('\n🧪 Testing URL Constructor with Filters\n');
console.log('=' .repeat(60));

// Test 1: No filters (all set to 'all')
const noFilters: FilterState = {
  malicious: 'all',
  fluxType: 'all',
  domainStatus: 'all'
};

const url1 = urlConstructor.buildSearchUrl({
  fields: ['domain_name', 'dom_status', 'is_malicious', 'flux_type'],
  limit: 10,
  sort: [{ id: 'dom_last_seen', desc: true }],
  filters: {}
});

console.log('\n✅ Test 1: No filters');
console.log(url1);

// Test 2: Malicious only filter
const url2 = urlConstructor.buildSearchUrl({
  fields: ['domain_name', 'dom_status', 'is_malicious', 'flux_type'],
  limit: 10,
  sort: [{ id: 'dom_last_seen', desc: true }],
  filters: {
    is_malicious: true
  }
});

console.log('\n✅ Test 2: Malicious only (is_malicious=true)');
console.log(url2);

// Test 3: Flux type filter
const url3 = urlConstructor.buildSearchUrl({
  fields: ['domain_name', 'dom_status', 'is_malicious', 'flux_type'],
  limit: 10,
  sort: [{ id: 'dom_last_seen', desc: true }],
  filters: {
    flux_type: 'double'
  }
});

console.log('\n✅ Test 3: Double flux (flux_type=double)');
console.log(url3);

// Test 4: Domain status filter
const url4 = urlConstructor.buildSearchUrl({
  fields: ['domain_name', 'dom_status', 'is_malicious', 'flux_type'],
  limit: 10,
  sort: [{ id: 'dom_last_seen', desc: true }],
  filters: {
    status: 'active'
  }
});

console.log('\n✅ Test 4: Active status (status=active)');
console.log(url4);

// Test 5: Combined filters
const url5 = urlConstructor.buildSearchUrl({
  fields: ['domain_name', 'dom_status', 'is_malicious', 'flux_type'],
  limit: 10,
  sort: [{ id: 'dom_last_seen', desc: true }],
  filters: {
    is_malicious: true,
    flux_type: 'single',
    status: 'active'
  }
});

console.log('\n✅ Test 5: Combined filters (malicious + single flux + active)');
console.log(url5);

// Test 6: Not equal operator
const url6 = urlConstructor.buildSearchUrl({
  fields: ['domain_name', 'dom_status', 'is_malicious', 'flux_type'],
  limit: 10,
  sort: [{ id: 'dom_last_seen', desc: true }],
  filters: {
    'flux_type.neq': 'unknown'
  }
});

console.log('\n✅ Test 6: Exclude unknown flux (flux_type.neq=unknown)');
console.log(url6);

console.log('\n' + '='.repeat(60));
console.log('✅ All tests completed!\n');
