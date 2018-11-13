<?php

namespace App\Command\BusStop;

use App\Command\CommandInterface;
use Ramsey\Uuid\UuidInterface;

final class ChangeBusStopGroupCommand implements CommandInterface
{
    private $id;
    private $group;

    public function __construct(UuidInterface $id, ?UuidInterface $group = null)
    {
        $this->id = $id;
        $this->group = $group;
    }

    public function id(): UuidInterface
    {
        return $this->id;
    }

    public function group(): ?UuidInterface
    {
        return $this->group;
    }
}