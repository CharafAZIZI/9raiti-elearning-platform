using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MicroServiceDotNet.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "utilisateur",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    mot_de_passe = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    telephone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    nom = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    prenom = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "APPRENANT"),
                    est_actif = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    est_valide = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    EmailConfirmationToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    date_creation = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    photo_profil = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PasswordResetToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PasswordResetTokenExpiry = table.Column<DateTime>(type: "datetime2", nullable: true),
                    provider = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Local"),
                    google_id = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_utilisateur", x => x.id);
                    table.CheckConstraint("CK_utilisateur_role", "role IN ('ADMIN', 'ENSEIGNANT', 'APPRENANT')");
                });

            migrationBuilder.CreateTable(
                name: "apprenant",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false),
                    niveau_scolaire = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    statut = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    score = table.Column<double>(type: "float", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_apprenant", x => x.id);
                    table.CheckConstraint("CK_apprenant_statut", "statut IN ('ACTIF', 'SUSPENDU')");
                    table.ForeignKey(
                        name: "FK_apprenant_utilisateur_id",
                        column: x => x.id,
                        principalTable: "utilisateur",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "enseignant",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false),
                    specialite = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    date_embauche = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_enseignant", x => x.id);
                    table.ForeignKey(
                        name: "FK_enseignant_utilisateur_id",
                        column: x => x.id,
                        principalTable: "utilisateur",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_utilisateur_email",
                table: "utilisateur",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "apprenant");

            migrationBuilder.DropTable(
                name: "enseignant");

            migrationBuilder.DropTable(
                name: "utilisateur");
        }
    }
}
