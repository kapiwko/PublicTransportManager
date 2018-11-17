<?php

namespace App\ViewData;

use JsonSerializable;
use Ramsey\Uuid\UuidInterface;

class BusStopGroupDataCollection implements JsonSerializable
{
    private $items = [];

    public function add(BusStopGroupData $data): void
    {
        $this->items[(string)$data->id()] = $data;
    }

    public function get(UuidInterface $id): ?BusStopGroupData
    {
        return $this->items[(string)$id] ?? null;
    }

    public function jsonSerialize(): array
    {
        return array_map(function (BusStopGroupData $data) {
            return [
                'id' => $data->id(),
                'data' => $data,
            ];
        }, array_values($this->items));
    }
}