import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/components/date-picker.css';
import { parseISODate, dateToISO } from '../../lib/utils/dateUtils';

interface DatePickerFieldProps {
  value: string | null;
  onChange: (isoString: string) => void;
  onBlur: () => void;
  hasError: boolean;
  minDate?: Date;
  maxDate?: Date;
}

/**
 * DatePickerField component
 * Wraps react-datepicker with dark mode styling and ISO date string handling
 * Displays dates in dd/mm/yyyy format while storing as ISO strings
 */
const DatePickerField: React.FC<DatePickerFieldProps> = ({
  value,
  onChange,
  onBlur,
  hasError,
  minDate = new Date(2000, 0, 1), // Default: 2000-01-01
  maxDate = new Date(new Date().getFullYear() + 1, 11, 31), // Default: end of next year
}) => {
  // Convert ISO string to Date object for the picker
  const dateValue = parseISODate(value);

  // Handle date selection
  const handleChange = (date: Date | null) => {
    if (date) {
      const isoString = dateToISO(date);
      onChange(isoString);
    } else {
      onChange('');
    }
  };

  return (
    <DatePicker
      selected={dateValue}
      onChange={handleChange}
      onBlur={onBlur}
      dateFormat="dd/MM/yyyy"
      minDate={minDate}
      maxDate={maxDate}
      showYearDropdown
      showMonthDropdown
      dropdownMode="select"
      placeholderText="dd/mm/yyyy"
      className={hasError ? 'error' : ''}
      isClearable
    />
  );
};

export default DatePickerField;

