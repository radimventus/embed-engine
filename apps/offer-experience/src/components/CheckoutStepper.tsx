import type { CheckoutStep } from '../checkout/checkoutRuntime';

const STEPS: readonly { readonly id: CheckoutStep; readonly label: string }[] =
  Object.freeze([
    { id: 'select', label: 'Balíček' },
    { id: 'checkout', label: 'Objednávka' },
    { id: 'confirm', label: 'Potvrzení' },
    { id: 'proforma', label: 'Proforma' },
    { id: 'qr', label: 'QR platba' },
    { id: 'complete', label: 'Hotovo' },
  ]);

type CheckoutStepperProps = {
  readonly step: CheckoutStep;
};

export function CheckoutStepper({ step }: CheckoutStepperProps) {
  const activeIndex = STEPS.findIndex((item) => item.id === step);

  return (
    <ol className="offer-stepper" data-testid="offer-checkout-stepper">
      {STEPS.map((item, index) => {
        const status =
          index < activeIndex
            ? 'done'
            : index === activeIndex
              ? 'active'
              : 'todo';
        return (
          <li
            key={item.id}
            className={`offer-stepper__item offer-stepper__item--${status}`}
            data-step={item.id}
            aria-current={status === 'active' ? 'step' : undefined}
          >
            <span className="offer-stepper__index">{index + 1}</span>
            <span className="offer-stepper__label">{item.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
