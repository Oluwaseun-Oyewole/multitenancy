import { MigrationInterface, QueryRunner } from "typeorm";

export class Public1781867559778 implements MigrationInterface {
    name = 'Public1781867559778'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tenants_status_enum" AS ENUM('PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED')`);
        await queryRunner.query(`CREATE TYPE "public"."tenants_plan_enum" AS ENUM('FREE', 'PRO', 'ENTERPRISE')`);
        await queryRunner.query(`CREATE TABLE "tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "tenant_owner_email" character varying NOT NULL, "schema_name" character varying NOT NULL, "status" "public"."tenants_status_enum" NOT NULL DEFAULT 'PENDING', "plan" "public"."tenants_plan_enum" NOT NULL DEFAULT 'FREE', CONSTRAINT "UQ_2310ecc5cb8be427097154b18fc" UNIQUE ("slug"), CONSTRAINT "UQ_03c2af5c19d2dfa8a6083df0195" UNIQUE ("tenant_owner_email"), CONSTRAINT "UQ_c2a961556326eec0e3b19f3ced5" UNIQUE ("schema_name"), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."invitations_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED')`);
        await queryRunner.query(`CREATE TYPE "public"."invitations_role_enum" AS ENUM('owner', 'admin', 'member')`);
        await queryRunner.query(`CREATE TABLE "invitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "tenant_schema" character varying NOT NULL, "status" "public"."invitations_status_enum" NOT NULL DEFAULT 'PENDING', "email" character varying NOT NULL, "role" "public"."invitations_role_enum" NOT NULL DEFAULT 'member', "token" character varying NOT NULL, "invited_by_user_id" character varying NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "accepted_at" TIMESTAMP WITH TIME ZONE, "revoked_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_e577dcf9bb6d084373ed3998509" UNIQUE ("token"), CONSTRAINT "PK_5dec98cfdfd562e4ad3648bbb07" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "invitations"`);
        await queryRunner.query(`DROP TYPE "public"."invitations_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."invitations_status_enum"`);
        await queryRunner.query(`DROP TABLE "tenants"`);
        await queryRunner.query(`DROP TYPE "public"."tenants_plan_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tenants_status_enum"`);
    }

}
