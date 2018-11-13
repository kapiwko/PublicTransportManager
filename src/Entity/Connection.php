<?php

namespace App\Entity;

use CrEOF\Spatial\PHP\Types\AbstractLineString;
use CrEOF\Spatial\PHP\Types\Geometry\LineString;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\UuidInterface;

/** @ORM\Entity() */
class Connection
{
    /**
     * @var UuidInterface
     *
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="NONE")
     * @ORM\Column(type="uuid", unique=true)
     */
    private $id;

    /**
     * @var BusStop
     *
     * @ORM\ManyToOne(targetEntity="BusStop");
     * @ORM\JoinColumn(nullable=false)
     */
    private $from;

    /**
     * @var BusStop
     *
     * @ORM\ManyToOne(targetEntity="BusStop");
     * @ORM\JoinColumn(nullable=false)
     */
    private $to;

    /**
     * @var AbstractLineString
     *
     * @ORM\Column(type="linestring")
     */
    private $geometry;

    public function __construct(UuidInterface $id, BusStop $from, BusStop $to)
    {
        $this->id = $id;
        $this->from = $from;
        $this->to = $to;
        $this->geometry = new LineString([$from->location(), $to->location()]);
    }

    public function from(): BusStop
    {
        return $this->from;
    }

    public function to(): BusStop
    {
        return $this->to;
    }

    public function geometry(): AbstractLineString
    {
        return $this->geometry;
    }

    public function changeGeometry(?AbstractLineString $geometry): void
    {
        if ($geometry instanceof AbstractLineString) {
            if (!$this->from->isLocatedAt($geometry->getPoint(0))) {
                throw new \LogicException('First point must be bus stop');
            }
            if (!$this->to->isLocatedAt($geometry->getPoint(-1))) {
                throw new \LogicException('Last point must be bus stop');
            }
            $this->geometry = $geometry;
        } else {
            $this->geometry = new LineString([$this->from->location(), $this->to->location()]);
        }
    }
}