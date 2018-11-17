<?php

namespace App\ViewData;

use JsonSerializable;
use Ramsey\Uuid\UuidInterface;

class BusStopDataCollection implements JsonSerializable
{
    private $items = [];

    public function add(BusStopData $data): void
    {
        $this->items[(string)$data->id()] = $data;
    }

    public function get(UuidInterface $id): ?BusStopData
    {
        return $this->items[(string)$id] ?? null;
    }

    public function jsonSerialize(): array
    {
        return array_map(function (BusStopData $data) {
            return [
                'id' => $data->id(),
                'data' => $data,
            ];
        }, array_values($this->items));
    }
}