import { useSelector } from "react-redux";
import { DollarSign, IndianRupee } from "lucide-react";
import { store } from "../store/store";

// Currency configuration with their respective locales
const currencyConfig = {
  USD: {
    locale: "en-US",
    currency: "USD",
    icon: DollarSign,
  },
  INR: {
    locale: "en-IN",
    currency: "INR",
    icon: IndianRupee,
  },
};

// Dynamic currency formatter that gets currency from Redux store
export const formatCurrency = (amount, currency = null) => {
  // If no currency is provided, get it from Redux store
  const currentCurrency = currency || store.getState().crm.currency;

  // Get the configuration for the current currency
  const config = currencyConfig[currentCurrency] || currencyConfig.USD;

  const formatter = new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
  });

  return formatter.format(amount);
};

// Get currency icon component
export const getCurrencyIcon = (currency = null) => {
  const currentCurrency = currency || store.getState().crm.currency;
  const config = currencyConfig[currentCurrency] || currencyConfig.USD;
  return config.icon;
};

// React hook that automatically re-renders when currency changes
export const useCurrency = () => {
  const currency = useSelector((state) => state.crm.currency);

  const formatAmount = (amount) => {
    return formatCurrency(amount, currency);
  };

  const getCurrencyIconComponent = () => {
    const config = currencyConfig[currency] || currencyConfig.USD;
    return config.icon;
  };

  return {
    currency,
    formatCurrency: formatAmount,
    CurrencyIcon: getCurrencyIconComponent(),
  };
};

// Hook version for React components (alternative approach)
export const useCurrencyFormatter = () => {
  const getCurrentCurrency = () => {
    return store.getState().crm.currency;
  };

  const formatAmount = (amount) => {
    const currentCurrency = getCurrentCurrency();
    return formatCurrency(amount, currentCurrency);
  };

  return { formatAmount, currentCurrency: getCurrentCurrency() };
};
