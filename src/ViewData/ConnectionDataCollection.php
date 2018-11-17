<?php

namespace App\ViewData;

use JsonSerializable;
use Ramsey\Uuid\UuidInterface;

class ConnectionDataCollection implements JsonSerializable
{
    private $items = [];

    public function add(ConnectionData $data): void
    {
        $this->items[(string)$data->id()] = $data;
    }

    public function get(UuidInterface $id): ?ConnectionData
    {
        return $this->items[(string)$id] ?? null;
    }

    public function jsonSerialize(): array
    {
        return array_map(function (ConnectionData $data) {
            return [
                'id' => $data->id(),
                'data' => $data,
            ];
        }, array_values($this->items));
    }
}