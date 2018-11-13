<?php

namespace App\Command\Line;

use App\Command\CommandInterface;
use CrEOF\Spatial\PHP\Types\AbstractLineString;
use Ramsey\Uuid\Uuid;

final class UpdateLineCommand implements CommandInterface
{
    private $id;
    private $name;
    /** @var array|Uuid[] */
    private $connections;

    public function __construct(Uuid $id, string $name, array $connections = [])
    {
        $this->id = $id;
        $this->name = $name;
        $this->connections = $connections;
    }

    public function id(): Uuid
    {
        return $this->id;
    }

    public function name(): string
    {
        return $this->name;
    }

    /**
     * @return array|Uuid[]
     */
    public function connections(): array
    {
        return $this->connections;
    }
}