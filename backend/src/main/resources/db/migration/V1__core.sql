CREATE TABLE admission_lock (id INTEGER PRIMARY KEY);
INSERT INTO admission_lock(id) VALUES (1);

CREATE TABLE designs (
    id UUID PRIMARY KEY,
    owner_id VARCHAR(100) NOT NULL,
    title VARCHAR(120) NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    graph_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX designs_owner_updated ON designs(owner_id, updated_at);
CREATE TABLE design_versions (
    design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    graph_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(design_id, version)
);
CREATE TABLE simulation_runs (
    id UUID PRIMARY KEY,
    owner_id VARCHAR(100) NOT NULL,
    request_text TEXT NOT NULL,
    request_hash VARCHAR(64) NOT NULL,
    idempotency_key VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('QUEUED','RUNNING','DONE','FAILED','TIMED_OUT')),
    attempt INTEGER NOT NULL DEFAULT 0,
    lease_token UUID,
    lease_until TIMESTAMP WITH TIME ZONE,
    result_text TEXT,
    error_message VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(owner_id,idempotency_key)
);
CREATE INDEX runs_status_created ON simulation_runs(status,created_at);
CREATE INDEX runs_owner_created ON simulation_runs(owner_id,created_at);
CREATE INDEX runs_lease ON simulation_runs(status,lease_until);
CREATE TABLE lesson_progress (
    owner_id VARCHAR(100) NOT NULL,
    lesson_id VARCHAR(60) NOT NULL,
    run_id UUID NOT NULL REFERENCES simulation_runs(id),
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(owner_id,lesson_id)
);
