CREATE TABLE audits (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL,
  area VARCHAR(100) NOT NULL,
  auditor VARCHAR(100) NOT NULL,
  audit_date DATE NOT NULL,
  risk_type VARCHAR(100) NOT NULL,
  potential VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  responsible VARCHAR(100) NOT NULL,
  deadline DATE NOT NULL,
  status VARCHAR(50) NOT NULL,
  photos TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audits_area ON audits(area);
CREATE INDEX idx_audits_auditor ON audits(auditor);
CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_audits_risk_type ON audits(risk_type);
CREATE INDEX idx_audits_potential ON audits(potential);
CREATE INDEX idx_audits_audit_date ON audits(audit_date);
