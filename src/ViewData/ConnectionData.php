<?php

namespace App\ViewData;

use CrEOF\Spatial\PHP\Types\AbstractLineString;
use JsonSerializable;
use Ramsey\Uuid\UuidInterface;

class ConnectionData implements JsonSerializable
{
    private $id;
    private $from;
    private $to;
    private $geometry;

    public function __construct(UuidInterface $id, UuidInterface $from, UuidInterface $to, AbstractLineString $geometry)
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

    public function geometry(): AbstractLineString
    {
        return $this->geometry;
    }

    public function jsonSerialize(): array
    {
        return [
            'from' => $this->from,
            'to' => $this->to,
            'geometry' => $this->geometry->toArray(),
        ];
    }
}