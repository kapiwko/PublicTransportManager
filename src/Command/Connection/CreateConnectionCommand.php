<?php

namespace App\Command\Connection;

use App\Command\CommandInterface;
use CrEOF\Spatial\PHP\Types\AbstractLineString;
use Ramsey\Uuid\UuidInterface;

final class CreateConnectionCommand implements CommandInterface
{
    private $id;
    private $from;
    private $to;
    private $geometry;

    public function __construct(UuidInterface $id, UuidInterface $from, UuidInterface $to, ?AbstractLineString $geometry = null)
    {
        $this->id = $id;
        $this->from = $from;
        $this->to = $to;
        $this->geometry = $geometry;
    }

    public function id(): UuidInterface
    {
        return $this->id;
    }

    public function from(): UuidInterface
    {
        return $this->from;
    }

    public function to(): UuidInterface
    {
        return $this->to;
    }

    public function geometry(): ?AbstractLineString
    {
        return $this->geometry;
    }
}