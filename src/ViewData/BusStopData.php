<?php

namespace App\ViewData;

use CrEOF\Spatial\PHP\Types\AbstractPoint;
use JsonSerializable;
use Ramsey\Uuid\UuidInterface;

class BusStopData implements JsonSerializable
{
    private $id;
    private $location;
    private $group;

    public function __construct(UuidInterface $id, AbstractPoint $location, ?UuidInterface $group)
    {
        $this->id = $id;
        $this->location = $location;
        $this->group = $group;
    }

    public function id(): UuidInterface
    {
        return $this->id;
    }

    public function location(): AbstractPoint
    {
        return $this->location;
    }

    public function group(): ?UuidInterface
    {
        return $this->group;
    }

    public function jsonSerialize(): array
    {
        return [
            'location' => $this->location->toArray(),
            'group' => $this->group,
        ];
    }
}