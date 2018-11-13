<?php

namespace App\Command\Connection;

use App\Command\CommandInterface;
use CrEOF\Spatial\PHP\Types\AbstractLineString;
use Ramsey\Uuid\UuidInterface;

final class UpdateConnectionCommand implements CommandInterface
{
    private $id;
    private $geometry;

    public function __construct(UuidInterface $id, ?AbstractLineString $geometry = null)
    {
        $this->id = $id;
        $this->geometry = $geometry;
    }

    public function id(): UuidInterface
    {
        return $this->id;
    }

    public function geometry(): ?AbstractLineString
    {
        return $this->geometry;
    }
}