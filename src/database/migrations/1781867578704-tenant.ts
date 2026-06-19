import { MigrationInterface, QueryRunner } from "typeorm";

export class Tenant1781867578704 implements MigrationInterface {
    name = 'Tenant1781867578704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_tenant_template"."products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "description" character varying, "tenant_schema" character varying NOT NULL, CONSTRAINT "UQ_a870a448d7a274f305a0937265c" UNIQUE ("tenant_schema"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "temporary_tenant_template"."feedback_status_enum" AS ENUM('OPEN', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED')`);
        await queryRunner.query(`CREATE TYPE "temporary_tenant_template"."feedback_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH')`);
        await queryRunner.query(`CREATE TYPE "temporary_tenant_template"."feedback_feedback_type_enum" AS ENUM('BUG', 'FEATURE_REQUEST', 'IMPROVEMENT')`);
        await queryRunner.query(`CREATE TABLE "temporary_tenant_template"."feedback" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "content" character varying, "status" "temporary_tenant_template"."feedback_status_enum", "priority" "temporary_tenant_template"."feedback_priority_enum", "feedback_type" "temporary_tenant_template"."feedback_feedback_type_enum", "voteCount" integer DEFAULT '0', "user_id" character varying NOT NULL, "product_id" uuid, "change_log_id" uuid, CONSTRAINT "PK_8389f9e087a57689cd5be8b2b13" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "temporary_tenant_template"."change-logs_type_enum" AS ENUM('feature', 'improvement', 'bugfix', 'breaking', 'security')`);
        await queryRunner.query(`CREATE TYPE "temporary_tenant_template"."change-logs_status_enum" AS ENUM('draft', 'published', 'archived')`);
        await queryRunner.query(`CREATE TABLE "temporary_tenant_template"."change-logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "product_id" uuid NOT NULL, "title" character varying NOT NULL, "content" text NOT NULL, "type" "temporary_tenant_template"."change-logs_type_enum" NOT NULL DEFAULT 'bugfix', "status" "temporary_tenant_template"."change-logs_status_enum" NOT NULL DEFAULT 'draft', "version" character varying, "published_at" TIMESTAMP, CONSTRAINT "PK_87f1f3033bac75e6ac3ee32866b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "temporary_tenant_template"."users_role_enum" AS ENUM('owner', 'admin', 'member')`);
        await queryRunner.query(`CREATE TABLE "temporary_tenant_template"."users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying NOT NULL, "role" "temporary_tenant_template"."users_role_enum" NOT NULL DEFAULT 'member', "password_hash" character varying, "display_name" character varying NOT NULL, "avatar_url" character varying, "activated_at" TIMESTAMP, "password_changed_at" TIMESTAMP, "last_login_date" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "temporary_tenant_template"."feedback" ADD CONSTRAINT "FK_2477562980219ad72afcbe73530" FOREIGN KEY ("product_id") REFERENCES "temporary_tenant_template"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "temporary_tenant_template"."feedback" ADD CONSTRAINT "FK_1c08b2ed11261c8382273d0eaa6" FOREIGN KEY ("change_log_id") REFERENCES "temporary_tenant_template"."change-logs"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "temporary_tenant_template"."change-logs" ADD CONSTRAINT "FK_c3b0853ef921da572f0ba83696e" FOREIGN KEY ("product_id") REFERENCES "temporary_tenant_template"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "temporary_tenant_template"."change-logs" DROP CONSTRAINT "FK_c3b0853ef921da572f0ba83696e"`);
        await queryRunner.query(`ALTER TABLE "temporary_tenant_template"."feedback" DROP CONSTRAINT "FK_1c08b2ed11261c8382273d0eaa6"`);
        await queryRunner.query(`ALTER TABLE "temporary_tenant_template"."feedback" DROP CONSTRAINT "FK_2477562980219ad72afcbe73530"`);
        await queryRunner.query(`DROP TABLE "temporary_tenant_template"."users"`);
        await queryRunner.query(`DROP TYPE "temporary_tenant_template"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "temporary_tenant_template"."change-logs"`);
        await queryRunner.query(`DROP TYPE "temporary_tenant_template"."change-logs_status_enum"`);
        await queryRunner.query(`DROP TYPE "temporary_tenant_template"."change-logs_type_enum"`);
        await queryRunner.query(`DROP TABLE "temporary_tenant_template"."feedback"`);
        await queryRunner.query(`DROP TYPE "temporary_tenant_template"."feedback_feedback_type_enum"`);
        await queryRunner.query(`DROP TYPE "temporary_tenant_template"."feedback_priority_enum"`);
        await queryRunner.query(`DROP TYPE "temporary_tenant_template"."feedback_status_enum"`);
        await queryRunner.query(`DROP TABLE "temporary_tenant_template"."products"`);
    }

}
