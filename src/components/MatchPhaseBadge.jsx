function MatchPhaseBadge({ phase }) {
  let label = "Unknown";
  let className = "bg-secondary";

  switch (phase) {
    case 1:
      label = "Opening";
      className = "bg-primary";
      break;
    case 2:
      label = "Rebuttal";
      className = "bg-info text-dark";
      break;
    case 3:
      label = "Voting";
      className = "bg-warning text-dark";
      break;
    case 4:
      label = "Closed";
      className = "bg-dark";
      break;
    default:
      break;
  }

  return <span className={`badge ${className}`}>{label}</span>;
}

export default MatchPhaseBadge;
