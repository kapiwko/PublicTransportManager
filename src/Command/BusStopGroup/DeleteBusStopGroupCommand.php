<?php

namespace App\Command\BusStopGroup;

use App\Command\CommandInterface;
use Ramsey\Uuid\UuidInterface;

final class DeleteBusStopGroupCommand implements CommandInterface
{
    private $id;

    public function __construct(UuidInterface $id)
    {
        $this->id = $id;
    }

    public function id(): UuidInterface
    {
        return $this->id;
    }
}