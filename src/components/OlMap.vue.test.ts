// src/components/OlMap.vue.test.ts
import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import OlMap from '@/components/OlMap.vue';

describe('OlMap.vue', () => {
  it('mounts and unmounts without crashing', async () => {
    const wrapper = mount(OlMap, {
      // OL likes having a real DOM node attached
      attachTo: document.body,

      // Avoid Quasar in this test (legend uses Quasar)
      global: {
        stubs: {
          OlMapLegend: true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.exists()).toBe(true);

    wrapper.unmount();
  });

  it('renders the legend component', async () => {
    const wrapper = mount(OlMap, {
      attachTo: document.body,
      global: {
        stubs: {
          OlMapLegend: {
            name: 'OlMapLegend',
            template: '<div data-test="legend" />',
          },
        },
      },
    });

    await flushPromises();

    expect(wrapper.find('[data-test="legend"]').exists()).toBe(true);

    wrapper.unmount();
  });
});
