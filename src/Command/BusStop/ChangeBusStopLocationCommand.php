<?php

namespace App\Command\BusStop;

use App\Command\CommandInterface;
use CrEOF\Spatial\PHP\Types\AbstractPoint;
use Ramsey\Uuid\UuidInterface;

final class ChangeBusStopLocationCommand implements CommandInterface
{
    private $id;
    private $location;

    public function __construct(UuidInterface $id, AbstractPoint $location)
    {
        $this->id = $id;
        $this->location = $location;
    }

    public function id(): UuidInterface
    {
        return $this->id;
    }

    public function location(): AbstractPoint
    {
        return $this->location;
    }
}