import { useBungkus } from '../index';

export function useBungkusWizard(wizardName: string, step: number) {
  const uniqueStepId = `${wizardName}-step-${step}`;

  const bungkus = useBungkus(uniqueStepId);

  return {
    ...bungkus,
    wizardInfo: {
      currentStep: step,
      storageKey: uniqueStepId
    }
  };
}