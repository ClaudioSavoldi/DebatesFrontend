function DebateStatusBadge({ status }) {
  let label = "Unknown";
  let className = "bg-secondary";

  switch (status) {
    case 1:
      label = "Open";
      className = "bg-secondary";
      break;
    case 2:
      label = "In review";
      className = "bg-warning text-dark";
      break;
    case 3:
      label = "Approved";
      className = "bg-success";
      break;
    case 4:
      label = "Rejected";
      className = "bg-danger";
      break;
    case 5:
      label = "Closed";
      className = "bg-dark";
      break;
    default:
      break;
  }

  return <span className={`badge ${className}`}>{label}</span>;
}

export default DebateStatusBadge;
