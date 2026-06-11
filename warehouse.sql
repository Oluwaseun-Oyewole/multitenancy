
CREATE SCHEMA warehouse;

CREATE TABLE warehouse.events_raw AS
SELECT * FROM "seun_26"."changelog"."events_raw"


-- date partitioning
CREATE TABLE IF NOT EXISTS "seun-26"."partitioned_change-logs"
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    product_id uuid NOT NULL,
    title character varying COLLATE pg_catalog."default" NOT NULL,
    content text COLLATE pg_catalog."default" NOT NULL,
    type "seun-26"."change-logs_type_enum" NOT NULL DEFAULT 'bugfix'::"seun-26"."change-logs_type_enum",
    status "seun-26"."change-logs_status_enum" NOT NULL DEFAULT 'draft'::"seun-26"."change-logs_status_enum",
    version character varying COLLATE pg_catalog."default",
    published_at timestamp without time zone,
    CONSTRAINT "PK_87f1f3033bac75e6ac3ee32866c" PRIMARY KEY (id, created_at),
    CONSTRAINT "FK_c3b0853ef921da572f0ba83696e" FOREIGN KEY (product_id)
        REFERENCES "seun-26".products (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
) PARTITION BY RANGE (created_at);

ALTER TABLE IF EXISTS "seun-26"."partitioned_change-logs"
    OWNER TO admin;


-- Create partitions for each year
CREATE TABLE "seun-26"."partitioned_change-logs_2024"
CREATE TABLE "seun-26"."partitioned_change-logs_2025"
    PARTITION OF "seun-26"."partitioned_change-logs"
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE "seun-26"."partitioned_change-logs_2026"
    PARTITION OF "seun-26"."partitioned_change-logs"
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');