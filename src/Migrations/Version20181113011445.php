<?php declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20181113011445 extends AbstractMigration
{
    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('CREATE EXTENSION IF NOT EXISTS postgis');
        $this->addSql('CREATE EXTENSION IF NOT EXISTS postgis_topology');
        $this->addSql('CREATE TABLE bus_stop (id UUID NOT NULL, group_id UUID DEFAULT NULL, location Geometry(Point) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_E65B69FCFE54D947 ON bus_stop (group_id)');
        $this->addSql('COMMENT ON COLUMN bus_stop.id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN bus_stop.group_id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN bus_stop.location IS \'(DC2Type:point)\'');
        $this->addSql('CREATE TABLE line (id UUID NOT NULL, name VARCHAR(30) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('COMMENT ON COLUMN line.id IS \'(DC2Type:uuid)\'');
        $this->addSql('CREATE TABLE line_connection (line_id UUID NOT NULL, connection_id UUID NOT NULL, PRIMARY KEY(line_id, connection_id))');
        $this->addSql('CREATE INDEX IDX_974C608D4D7B7542 ON line_connection (line_id)');
        $this->addSql('CREATE INDEX IDX_974C608DDD03F01 ON line_connection (connection_id)');
        $this->addSql('COMMENT ON COLUMN line_connection.line_id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN line_connection.connection_id IS \'(DC2Type:uuid)\'');
        $this->addSql('CREATE TABLE connection (id UUID NOT NULL, from_id UUID NOT NULL, to_id UUID NOT NULL, geometry Geometry(LineString) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_29F7736678CED90B ON connection (from_id)');
        $this->addSql('CREATE INDEX IDX_29F7736630354A65 ON connection (to_id)');
        $this->addSql('COMMENT ON COLUMN connection.id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN connection.from_id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN connection.to_id IS \'(DC2Type:uuid)\'');
        $this->addSql('COMMENT ON COLUMN connection.geometry IS \'(DC2Type:linestring)\'');
        $this->addSql('CREATE TABLE bus_stop_group (id UUID NOT NULL, name VARCHAR(30) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('COMMENT ON COLUMN bus_stop_group.id IS \'(DC2Type:uuid)\'');
        $this->addSql('ALTER TABLE bus_stop ADD CONSTRAINT FK_E65B69FCFE54D947 FOREIGN KEY (group_id) REFERENCES bus_stop_group (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE line_connection ADD CONSTRAINT FK_974C608D4D7B7542 FOREIGN KEY (line_id) REFERENCES line (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE line_connection ADD CONSTRAINT FK_974C608DDD03F01 FOREIGN KEY (connection_id) REFERENCES connection (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE connection ADD CONSTRAINT FK_29F7736678CED90B FOREIGN KEY (from_id) REFERENCES bus_stop (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE connection ADD CONSTRAINT FK_29F7736630354A65 FOREIGN KEY (to_id) REFERENCES bus_stop (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'postgresql', 'Migration can only be executed safely on \'postgresql\'.');

        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE connection DROP CONSTRAINT FK_29F7736678CED90B');
        $this->addSql('ALTER TABLE connection DROP CONSTRAINT FK_29F7736630354A65');
        $this->addSql('ALTER TABLE line_connection DROP CONSTRAINT FK_974C608D4D7B7542');
        $this->addSql('ALTER TABLE line_connection DROP CONSTRAINT FK_974C608DDD03F01');
        $this->addSql('ALTER TABLE bus_stop DROP CONSTRAINT FK_E65B69FCFE54D947');
        $this->addSql('DROP TABLE bus_stop');
        $this->addSql('DROP TABLE line');
        $this->addSql('DROP TABLE line_connection');
        $this->addSql('DROP TABLE connection');
        $this->addSql('DROP TABLE bus_stop_group');
        $this->addSql('DROP EXTENSION postgis_topology');
        $this->addSql('DROP EXTENSION postgis');
    }
}
