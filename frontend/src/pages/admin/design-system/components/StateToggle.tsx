import { useState } from 'react';
import type { ReactNode } from 'react';

interface StateOption {
  name: string;
  component: ReactNode;
}

interface StateToggleProps {
  states: StateOption[];
  defaultState?: number;
}

export default function StateToggle({ states, defaultState = 0 }: StateToggleProps) {
  const [activeState, setActiveState] = useState(defaultState);

  return (
    <div className="state-toggle">
      <div className="state-toggle__controls">
        {states.map((state, index) => (
          <button
            key={index}
            className={`state-toggle__button ${activeState === index ? 'state-toggle__button--active' : ''}`}
            onClick={() => setActiveState(index)}
          >
            {state.name}
          </button>
        ))}
      </div>
      <div className="state-toggle__display">
        {states[activeState]?.component}
      </div>
    </div>
  );
}

