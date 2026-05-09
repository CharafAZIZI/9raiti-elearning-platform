-- ══════════════════════════════════════════════════════════════════════════
-- Migration : Système de Quiz
-- Compatible MySQL / PostgreSQL
-- ══════════════════════════════════════════════════════════════════════════

-- ── Table quiz ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz (
    id                     BIGINT AUTO_INCREMENT PRIMARY KEY,
    titre                  VARCHAR(255)   NOT NULL,
    description            TEXT,
    cours_id               BIGINT         NOT NULL,
    enseignant_id          BIGINT         NOT NULL,
    actif                  BOOLEAN        NOT NULL DEFAULT TRUE,
    date_creation          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Configuration
    correction_instantanee BOOLEAN        NOT NULL DEFAULT FALSE,
    temps_limite_minutes   INT,
    randomiser_questions   BOOLEAN        NOT NULL DEFAULT FALSE,
    randomiser_reponses    BOOLEAN        NOT NULL DEFAULT FALSE
);

-- ── Table question ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS question (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    texte    TEXT           NOT NULL,
    type     VARCHAR(20)    NOT NULL COMMENT 'QCM | VRAI_FAUX',
    ordre    INT            NOT NULL DEFAULT 0,
    quiz_id  BIGINT         NOT NULL,
    CONSTRAINT fk_question_quiz FOREIGN KEY (quiz_id) REFERENCES quiz(id) ON DELETE CASCADE
);

-- ── Table reponse ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reponse (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    texte         TEXT           NOT NULL,
    est_correcte  BOOLEAN        NOT NULL DEFAULT FALSE,
    question_id   BIGINT         NOT NULL,
    CONSTRAINT fk_reponse_question FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE
);

-- ── Table tentative_quiz ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tentative_quiz (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id    BIGINT         NOT NULL,
    utilisateur_nom   VARCHAR(255),
    quiz_id           BIGINT         NOT NULL,
    score_brut        INT            NOT NULL DEFAULT 0,
    score_sur_20      DOUBLE         NOT NULL DEFAULT 0,
    nombre_questions  INT            NOT NULL DEFAULT 0,
    date_tentative    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tentative_quiz FOREIGN KEY (quiz_id) REFERENCES quiz(id) ON DELETE CASCADE
);

-- ── Table reponse_utilisateur ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reponse_utilisateur (
    id                        BIGINT AUTO_INCREMENT PRIMARY KEY,
    tentative_id              BIGINT NOT NULL,
    question_id               BIGINT NOT NULL,
    reponse_id_selectionnee   BIGINT NOT NULL,
    CONSTRAINT fk_rep_util_tentative FOREIGN KEY (tentative_id) REFERENCES tentative_quiz(id) ON DELETE CASCADE
);

-- ── Index pour les recherches fréquentes ────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_quiz_cours_id        ON quiz(cours_id);
CREATE INDEX IF NOT EXISTS idx_quiz_enseignant_id   ON quiz(enseignant_id);
CREATE INDEX IF NOT EXISTS idx_question_quiz_id     ON question(quiz_id);
CREATE INDEX IF NOT EXISTS idx_reponse_question_id  ON reponse(question_id);
CREATE INDEX IF NOT EXISTS idx_tentative_user_id    ON tentative_quiz(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_tentative_quiz_id    ON tentative_quiz(quiz_id);
