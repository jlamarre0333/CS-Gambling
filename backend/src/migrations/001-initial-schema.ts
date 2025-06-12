import { MigrationInterface, QueryRunner, Table, Index, ForeignKey } from "typeorm"

export class InitialSchema1703500000001 implements MigrationInterface {
    name = 'InitialSchema1703500000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Users table
        await queryRunner.createTable(new Table({
            name: "users",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "gen_random_uuid()"
                },
                {
                    name: "steamId",
                    type: "varchar",
                    isUnique: true
                },
                {
                    name: "username",
                    type: "varchar"
                },
                {
                    name: "avatar",
                    type: "varchar"
                },
                {
                    name: "balance",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                    default: 0
                },
                {
                    name: "totalWagered",
                    type: "decimal",
                    precision: 15,
                    scale: 2,
                    default: 0
                },
                {
                    name: "totalWon",
                    type: "decimal",
                    precision: 15,
                    scale: 2,
                    default: 0
                },
                {
                    name: "gamesPlayed",
                    type: "integer",
                    default: 0
                },
                {
                    name: "level",
                    type: "integer",
                    default: 1
                },
                {
                    name: "experience",
                    type: "integer",
                    default: 0
                },
                {
                    name: "role",
                    type: "enum",
                    enum: ["user", "vip", "moderator", "admin"],
                    default: "'user'"
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ["active", "suspended", "banned"],
                    default: "'active'"
                },
                {
                    name: "email",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "twoFactorEnabled",
                    type: "boolean",
                    default: false
                },
                {
                    name: "twoFactorSecret",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "lastLoginIp",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "lastLoginAt",
                    type: "timestamp",
                    isNullable: true
                },
                {
                    name: "loginCount",
                    type: "integer",
                    default: 0
                },
                {
                    name: "preferences",
                    type: "jsonb",
                    default: "'{}'"
                },
                {
                    name: "statistics",
                    type: "jsonb",
                    default: "'{}'"
                },
                {
                    name: "referredBy",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "referralCount",
                    type: "integer",
                    default: 0
                },
                {
                    name: "referralEarnings",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                    default: 0
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }), true)

        // Games table
        await queryRunner.createTable(new Table({
            name: "games",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "gen_random_uuid()"
                },
                {
                    name: "type",
                    type: "enum",
                    enum: ["coinflip", "crash", "jackpot", "roulette", "blackjack", "tournament"]
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ["pending", "active", "completed", "cancelled"],
                    default: "'pending'"
                },
                {
                    name: "betAmount",
                    type: "decimal",
                    precision: 10,
                    scale: 2
                },
                {
                    name: "winAmount",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                    isNullable: true
                },
                {
                    name: "multiplier",
                    type: "decimal",
                    precision: 8,
                    scale: 4,
                    isNullable: true
                },
                {
                    name: "result",
                    type: "enum",
                    enum: ["win", "loss", "push", "cancelled"],
                    isNullable: true
                },
                {
                    name: "gameData",
                    type: "jsonb",
                    default: "'{}'"
                },
                {
                    name: "serverSeed",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "clientSeed",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "nonce",
                    type: "integer",
                    isNullable: true
                },
                {
                    name: "fairnessHash",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "gameHash",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "startedAt",
                    type: "timestamp",
                    isNullable: true
                },
                {
                    name: "completedAt",
                    type: "timestamp",
                    isNullable: true
                },
                {
                    name: "userId",
                    type: "uuid"
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }), true)

        // Transactions table
        await queryRunner.createTable(new Table({
            name: "transactions",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "gen_random_uuid()"
                },
                {
                    name: "type",
                    type: "enum",
                    enum: ["deposit", "withdrawal", "game_win", "game_loss", "referral_bonus", "admin_adjustment", "skin_deposit", "skin_withdrawal"]
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ["pending", "processing", "completed", "failed", "cancelled"],
                    default: "'pending'"
                },
                {
                    name: "amount",
                    type: "decimal",
                    precision: 15,
                    scale: 2
                },
                {
                    name: "fee",
                    type: "decimal",
                    precision: 8,
                    scale: 4,
                    default: 0
                },
                {
                    name: "netAmount",
                    type: "decimal",
                    precision: 15,
                    scale: 2
                },
                {
                    name: "paymentMethod",
                    type: "enum",
                    enum: ["steam_trade", "bitcoin", "ethereum", "paypal", "credit_card", "bank_transfer"],
                    isNullable: true
                },
                {
                    name: "externalTransactionId",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "gameId",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "description",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "metadata",
                    type: "jsonb",
                    default: "'{}'"
                },
                {
                    name: "adminNote",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "processedAt",
                    type: "timestamp",
                    isNullable: true
                },
                {
                    name: "userId",
                    type: "uuid"
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }), true)

        // Create foreign keys
        await queryRunner.createForeignKey("games", new ForeignKey({
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }))

        await queryRunner.createForeignKey("transactions", new ForeignKey({
            columnNames: ["userId"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }))

        // Create indexes for better performance
        await queryRunner.createIndex("users", new Index({
            name: "IDX_users_steamId",
            columnNames: ["steamId"]
        }))

        await queryRunner.createIndex("games", new Index({
            name: "IDX_games_userId",
            columnNames: ["userId"]
        }))

        await queryRunner.createIndex("games", new Index({
            name: "IDX_games_type_status",
            columnNames: ["type", "status"]
        }))

        await queryRunner.createIndex("transactions", new Index({
            name: "IDX_transactions_userId",
            columnNames: ["userId"]
        }))

        await queryRunner.createIndex("transactions", new Index({
            name: "IDX_transactions_type_status",
            columnNames: ["type", "status"]
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("transactions")
        await queryRunner.dropTable("games")
        await queryRunner.dropTable("users")
    }
} 