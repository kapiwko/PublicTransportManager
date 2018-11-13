<?php

namespace App\Command\Connection;

use App\Command\CommandInterface;
use Ramsey\Uuid\UuidInterface;

final class DeleteConnectionCommand implements CommandInterface
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