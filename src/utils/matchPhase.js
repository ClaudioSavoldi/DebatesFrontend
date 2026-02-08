export function phaseLabel(phase) {
  switch (phase) {
    case 1:
      return "Opening";
    case 2:
      return "Rebuttal";
    case 3:
      return "Voting";
    case 4:
      return "Closed";
    default:
      return `Phase ${phase}`;
  }
}
