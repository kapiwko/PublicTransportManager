<?php

namespace App\Tests\Entity;

use App\Entity\BusStop;
use App\Entity\BusStopGroup;
use App\Entity\Connection;
use CrEOF\Spatial\PHP\Types\Geometry\LineString;
use CrEOF\Spatial\PHP\Types\Geometry\Point;
use PHPUnit\Framework\TestCase;
use Ramsey\Uuid\Uuid;
use SebastianBergmann\Diff\Line;

class ConnectionTest extends TestCase
{
    public function testCreate(): void
    {
        $busStopFrom = new BusStop(Uuid::uuid4(), new Point(1, 1), new BusStopGroup(Uuid::uuid4(), 'test'));
        $busStopTo = new BusStop(Uuid::uuid4(), new Point(3, 3), new BusStopGroup(Uuid::uuid4(), 'test'));
        $connection = new Connection(Uuid::uuid4(), $busStopFrom, $busStopTo);
        $this->assertEquals(1, $connection->from()->location()->getX());
        $this->assertEquals(3, $connection->to()->location()->getX());
        $this->assertCount(2, $connection->geometry()->getPoints());

        $connection->changeGeometry(new LineString([new Point(1, 1), new Point(2, 2), new Point(3, 3)]));
        $this->assertCount(3, $connection->geometry()->getPoints());

        $this->expectException(\LogicException::class);
        $connection->changeGeometry(new LineString([new Point(0, 0), new Point(2, 2), new Point(3, 3)]));

        $this->expectException(\LogicException::class);
        $connection->changeGeometry(new LineString([new Point(1, 1), new Point(2, 2), new Point(4, 4)]));
    }
}