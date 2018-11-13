<?php

namespace App\Tests\Entity;

use App\Entity\BusStop;
use App\Entity\BusStopGroup;
use App\Entity\Connection;
use App\Entity\Line;
use CrEOF\Spatial\PHP\Types\Geometry\Point;
use PHPUnit\Framework\TestCase;
use Ramsey\Uuid\Uuid;

class LineTest extends TestCase
{
    public function testCreate(): void
    {
        $busStopFrom = new BusStop(Uuid::uuid4(), new Point(1, 1), new BusStopGroup(Uuid::uuid4(), 'test1'));
        $busStopTo = new BusStop(Uuid::uuid4(), new Point(2, 2), new BusStopGroup(Uuid::uuid4(), 'test2'));
        $connection1 = new Connection(Uuid::uuid4(), $busStopFrom, $busStopTo);

        $busStopFrom = new BusStop(Uuid::uuid4(), new Point(2, 2), new BusStopGroup(Uuid::uuid4(), 'test2'));
        $busStopTo = new BusStop(Uuid::uuid4(), new Point(3, 3), new BusStopGroup(Uuid::uuid4(), 'test3'));
        $connection2 = new Connection(Uuid::uuid4(), $busStopFrom, $busStopTo);

        $busStopFrom = new BusStop(Uuid::uuid4(), new Point(3, 3), new BusStopGroup(Uuid::uuid4(), 'test3'));
        $busStopTo = new BusStop(Uuid::uuid4(), new Point(4, 4), new BusStopGroup(Uuid::uuid4(), 'test4'));
        $connection3 = new Connection(Uuid::uuid4(), $busStopFrom, $busStopTo);

        $line = new Line(Uuid::uuid4(), '1');
        $line->addConnection($connection1);
        $line->addConnection($connection2);
        $line->addConnection($connection3);
        $this->assertCount(3, $line->connections());
    }
}