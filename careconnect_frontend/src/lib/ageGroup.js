export const labelOfAgeGroup = ag =>
  !ag                 ? ''         // null / undefined
: typeof ag === 'string' ? ag       // already a string
:                          ag.name; // object from backend