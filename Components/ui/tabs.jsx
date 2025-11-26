import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const TabsContext = createContext(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a <Tabs> root.');
  }
  return context;
}

export function Tabs({ defaultValue, value, onValueChange, children, className }) {
  const [internalValue, setInternalValue] = useState(value ?? defaultValue ?? null);

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleChange = (next) => {
    if (value === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };

  const contextValue = useMemo(
    () => ({ value: internalValue, onChange: handleChange }),
    [internalValue]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.propTypes = {
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  onValueChange: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
};

export function TabsList({ children, className, ...props }) {
  return (
    <div role="tablist" className={className} {...props}>
      {children}
    </div>
  );
}

TabsList.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export function TabsTrigger({ value, children, className, ...props }) {
  const { value: activeValue, onChange } = useTabsContext();
  const active = activeValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      data-state={active ? 'active' : 'inactive'}
      className={className}
      onClick={() => onChange(value)}
      {...props}
    >
      {children}
    </button>
  );
}

TabsTrigger.propTypes = {
  value: PropTypes.string.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
};

export function TabsContent({ value, children, className, ...props }) {
  const { value: activeValue } = useTabsContext();
  if (activeValue !== value) return null;

  return (
    <div role="tabpanel" className={className} {...props}>
      {children}
    </div>
  );
}

TabsContent.propTypes = {
  value: PropTypes.string.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
};
