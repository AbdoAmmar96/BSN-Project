import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Order-wizard draft state. Persisted to localStorage so a half-finished order
 * survives a refresh. `orderId` is set once the draft is saved server-side;
 * pricing always comes back from the API (never trusted client-side).
 */
// Local YYYY-MM-DD (matches <input type="date">), avoiding UTC off-by-one.
const todayISO = () => {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
};

const initialState = {
  step: 1,
  orderId: null,
  serviceType: null,
  packageId: null,
  addonIds: [],
  currency: 'EGP',
  couponCode: '',
  projectName: '',
  description: '',
  expectedLaunchDate: todayISO(), // default to today
  pricing: null, // last server breakdown
};

export const useOrderWizard = create(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ step }),
      next: () => set({ step: Math.min(get().step + 1, 5) }),
      back: () => set({ step: Math.max(get().step - 1, 1) }),

      setServiceType: (serviceType) => set({ serviceType, packageId: null, addonIds: [] }),
      setPackage: (packageId) => set({ packageId, addonIds: [] }),
      // Preselect a package coming from the public package-detail CTA: sets both
      // service + package at once and jumps to the add-ons step.
      preselectPackage: (serviceType, packageId) =>
        set({ serviceType, packageId, addonIds: [], step: 3 }),
      toggleAddon: (id) => set((s) => ({
        addonIds: s.addonIds.includes(id)
          ? s.addonIds.filter((x) => x !== id)
          : [...s.addonIds, id],
      })),
      setCurrency: (currency) => set({ currency }),
      setCoupon: (couponCode) => set({ couponCode }),
      setDetails: (patch) => set(patch),
      setOrderId: (orderId) => set({ orderId }),
      setPricing: (pricing) => set({ pricing }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'bsn_order_wizard',
      partialize: (s) => ({
        step: s.step,
        orderId: s.orderId,
        serviceType: s.serviceType,
        packageId: s.packageId,
        addonIds: s.addonIds,
        currency: s.currency,
        couponCode: s.couponCode,
        projectName: s.projectName,
        description: s.description,
        expectedLaunchDate: s.expectedLaunchDate,
      }),
    },
  ),
);
