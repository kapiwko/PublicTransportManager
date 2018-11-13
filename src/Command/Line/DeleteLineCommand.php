<?php

namespace App\Command\Line;

use App\Command\CommandInterface;
use Ramsey\Uuid\Uuid;

final class DeleteLineCommand implements CommandInterface
{
    private $id;

    public function __construct(Uuid $id)
    {
        $this->id = $id;
    }

    public function id(): Uuid
    {
        return $this->id;
    }
}