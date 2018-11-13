<?php

namespace App\Command\BusStopGroup;

use App\Command\CommandInterface;
use Ramsey\Uuid\UuidInterface;

final class CreateBusStopGroupCommand implements CommandInterface
{
    private $id;
    private $name;

    public function __construct(UuidInterface $id, string $name)
    {
        $this->id = $id;
        $this->name = $name;
    }

    public function id(): UuidInterface
    {
        return $this->id;
    }

    public function name(): string
    {
        return $this->name;
    }
}