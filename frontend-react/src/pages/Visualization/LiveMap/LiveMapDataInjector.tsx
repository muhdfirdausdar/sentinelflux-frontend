import { getStore, createStore } from '@/stores';
import type { LiveMapData } from './data';

/**
 * Small dev helper component to inject sample LiveMapData into the liveMapData store.
 * This helps testing the StaticMap rendering without an active SSE connection.
 */
export default function LiveMapDataInjector() {
  const inject = () => {
    // Build sample LiveMapData with multiple domains and IPs across the world
    const now = new Date();
    const format = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.000000`;
    };

    const sample: LiveMapData = {
      'example.com': {
        '102.165.0.1': {
          last_active: format(now),
          latitude: 3.1390,
          longitude: 101.6869,
          country: 'Malaysia',
          flux_type: 'single'
        },
        '102.165.0.2': {
          last_active: format(new Date(now.getTime() - 1000 * 60 * 60 * 2)),
          latitude: 3.1390,
          longitude: 101.6869,
          country: 'Malaysia',
          flux_type: 'double'
        }
      },
      'another.org': {
        '172.67.23.45': {
          last_active: format(new Date(now.getTime() - 1000 * 60 * 60 * 24)),
          latitude: 37.751,
          longitude: -97.822,
          country: 'United States',
          flux_type: 'name'
        }
      },
      'eu-site.net': {
        '88.198.0.1': {
          last_active: format(new Date(now.getTime() - 1000 * 60 * 30)),
          latitude: 52.52,
          longitude: 13.405,
          country: 'Germany',
          flux_type: 'double'
        }
      },
      'au-sample.au': {
        '1.1.1.1': {
          last_active: format(new Date(now.getTime() - 1000 * 60 * 60 * 6)),
          latitude: -33.8688,
          longitude: 151.2093,
          country: 'Australia',
          flux_type: 'single'
        }
      }
    };

    // Get existing store or create it (use same id used by useSSELiveMap)
    let store = getStore<LiveMapData | null>('liveMapData');
    if (!store) {
      store = createStore<LiveMapData | null>('liveMapData', null, {
        onChange: (newData, oldData) => {
          console.log('liveMapData store changed', { oldData, newData });
        }
      });
    }

    // Inject sample data (this will trigger transformation via hooks)
    store.set(sample);
    console.log('Injected sample LiveMapData into store');
  };

  return (
    <div style={{ position: 'fixed', left: 16, bottom: 16, zIndex: 9999 }}>
      <button
        onClick={inject}
        style={{
          background: '#0b1220',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '8px 12px',
          borderRadius: 6,
          cursor: 'pointer'
        }}
        title="Inject sample LiveMap data"
      >
        Inject sample data
      </button>
    </div>
  );
}
