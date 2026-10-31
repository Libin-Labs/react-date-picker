# @lp-labs/react-date-picker

Inline single-date/range calendar with disabled dates and locale formatting. React 18+ peer only; native UTC date operations and Intl, not a third-party date engine. ESM, CommonJS and TypeScript included.

## Installation

```sh
npm install @lp-labs/react-date-picker
```

## Quick Start

```jsx
import { useState } from 'react';
import { DatePicker } from '@lp-labs/react-date-picker';
export default function Example() {
  const [value, setValue] = useState(null);
  return (
    <DatePicker
      value={value}
      onChange={setValue}
      initialMonth="2026-10"
      min="2026-01-01"
      max="2027-12-31"
    />
  );
}
```

## API

Props: mode='single'/'range', value/defaultValue, onChange, min='1900-01-01', max='2100-12-31', disabledDate(ISO), disabledWeekdays (Sunday0..Saturday6), maxRangeDays=366, locale='en-US', firstDayOfWeek=1, initialMonth='YYYY-MM', label, name, disabled, className. Single values are ISO date strings/null; range values are[start,end], with null for incomplete endpoints. Clear emits null or[null,null]. name renders hidden inputs; ranges use name.start and name.end. initialMonth makes server/client initial month deterministic.

Arrow keys move through enabled dates, Home/End move to week edges, Enter/Space activate native day buttons. Month buttons navigate. Labels use Intl; selection/range logic uses date-only UTC values to avoid DST arithmetic. Range completion rejects disabled interior days. parseDate and formatDate are exported. The calendar is inline, not an input popover or free-text date parser.

## Benefits

| Area                   | Details                                                |
| ---------------------- | ------------------------------------------------------ |
| Date-only arithmetic   | Use canonical ISO dates and UTC calendar calculations. |
| Single and range modes | Share one calendar and disabled-date policy.           |
| Bounded calendar       | Limit years, range length, and disabled-day searching. |

## Customization

| Area         | Details                                                                 |
| ------------ | ----------------------------------------------------------------------- |
| Availability | Set minimum, maximum, disabled weekdays, and a disabled-date predicate. |
| Locale       | Choose formatting locale and first weekday.                             |
| Selection    | Choose single/range mode, controlled value, name, and initial month.    |

## Security And Limits

Supported years: 1,900–2,100; strict valid YYYY-MM-DD values only. Range limits: 1–3,660 days; keyboard disabled-day search is bounded to 366 attempts. Gregorian calendar only: formatting does not change arithmetic to a non-Gregorian calendar. Locale must be supported by Intl. No timezone appointment scheduling, time selection, holidays service, recurrence or full RTL keyboard mapping. Disabled dates are UI rules, not server authorization. Application servers must revalidate submitted dates. Test browser/screen-reader behavior before deployment.

## Support

[Donate via PayPal](https://www.paypal.me/LibinPrasanth). Author: [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/).

## License

MIT License. See the packaged [LICENSE](LICENSE) file.
