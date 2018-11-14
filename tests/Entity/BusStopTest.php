<?php

namespace App\Tests\Entity;

use App\Entity\BusStop;
use App\Entity\BusStopGroup;
use CrEOF\Spatial\PHP\Types\Geometry\Point;
use PHPUnit\Framework\TestCase;
use Ramsey\Uuid\Uuid;

class BusStopTest extends TestCase
{
    public function testCreate(): void
    {
        $busStop = new BusStop(Uuid::uuid4(), new Point(1, 1), new BusStopGroup(Uuid::uuid4(), 'test'));
        $this->assertTrue($busStop->isLocatedAt(new Point(1, 1)));
        $this->assertEquals('test', $busStop->group()->name());

        $busStop->changeLocation(new Point(2, 2));
        $this->assertFalse($busStop->isLocatedAt(new Point(1, 1)));
        $this->assertTrue($busStop->isLocatedAt(new Point(2, 2)));

        $busStop->changeGroup(new BusStopGroup(Uuid::uuid4(), 'test2'));
        $this->assertEquals('test2', $busStop->group()->name());
    }
}