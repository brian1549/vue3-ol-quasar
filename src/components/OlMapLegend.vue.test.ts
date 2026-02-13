import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import OlMapLegend from '@/components/OlMapLegend.vue';
import { Quasar } from 'quasar';

describe('OlMapLegend', () => {
  it('renders bucket keys', () => {
    const wrapper = mount(OlMapLegend, {
      props: {
        bucketKeys: ['1.0-1.5', '1.5-2.0'],
        getVisible: () => true,
      },
      global: { plugins: [Quasar] },
    });

    expect(wrapper.text()).toContain('1.0-1.5');
    expect(wrapper.text()).toContain('1.5-2.0');
  });

  it('emits toggle event', async () => {
    const wrapper = mount(OlMapLegend, {
      props: {
        bucketKeys: ['1.0-1.5'],
        getVisible: () => true,
      },
      global: { plugins: [Quasar] },
    });

    const toggles = wrapper.findAllComponents({ name: 'QToggle' });

    await toggles[1]!.vm.$emit('update:model-value', false);

    expect(wrapper.emitted('toggle')).toBeTruthy();
  });
});
