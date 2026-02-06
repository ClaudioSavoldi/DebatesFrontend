function AuthCard({ title, children }) {
  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h1 className="h4 mb-3">{title}</h1>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthCard;
