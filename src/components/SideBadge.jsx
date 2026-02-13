function SideBadge({ side }) {
  // side: 1 = Pro, 2 = Contro
  if (side === 1) return <span className="badge bg-success">PRO</span>;
  if (side === 2) return <span className="badge bg-danger">CONTRO</span>;
  return <span className="badge bg-secondary">—</span>;
}

export default SideBadge;
