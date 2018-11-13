<?php

namespace App\Command\BusStop;

use App\Command\CommandInterface;
use CrEOF\Spatial\PHP\Types\AbstractPoint;
use Ramsey\Uuid\UuidInterface;

final class CreateBusStopCommand implements CommandInterface
{
    private $id;
    private $location;
    private $group;

    public function __construct(UuidInterface $id, AbstractPoint $location, ?UuidInterface $group = null)
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
}