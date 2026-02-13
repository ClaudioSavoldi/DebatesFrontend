function SubmissionsPair({ title, proText, controText, emptyHint }) {
  return (
    <div className="card h-100">
      <div className="card-header fw-semibold">{title}</div>
      <div className="card-body">
        {!proText && !controText ? (
          <div className="text-muted">{emptyHint}</div>
        ) : (
          <div className="row g-3">
            <div className="col-md-6">
              <div className="border rounded p-3 h-100">
                <div className="fw-semibold mb-2">PRO</div>
                {proText ? <div style={{ whiteSpace: "pre-wrap" }}>{proText}</div> : <div className="text-muted">In attesa…</div>}
              </div>
            </div>
            <div className="col-md-6">
              <div className="border rounded p-3 h-100">
                <div className="fw-semibold mb-2">CONTRO</div>
                {controText ? <div style={{ whiteSpace: "pre-wrap" }}>{controText}</div> : <div className="text-muted">In attesa…</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubmissionsPair;
