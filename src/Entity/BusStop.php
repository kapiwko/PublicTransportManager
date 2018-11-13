<?php

namespace App\Entity;

use CrEOF\Spatial\PHP\Types\AbstractPoint;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\UuidInterface;

/** @ORM\Entity() */
class BusStop
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
     * @var BusStopGroup|null
     *
     * @ORM\ManyToOne(targetEntity="BusStopGroup");
     * @ORM\JoinColumn(nullable=true)
     */
    private $group;

    /**
     * @var AbstractPoint
     *
     * @ORM\Column(type="point")
     */
    private $location;

    public function __construct(UuidInterface $id, AbstractPoint $location, ?BusStopGroup $group = null)
    {
        $this->id = $id;
        $this->location = $location;
        $this->group = $group;
    }

    public function location(): AbstractPoint
    {
        return $this->location;
    }

    public function changeLocation(AbstractPoint $location): void
    {
        $this->location = $location;
    }

    public function isLocatedAt(AbstractPoint $point): bool
    {
        return $this->location->getX() === $point->getX() && $this->location->getY() === $point->getY();
    }

    public function group(): ?BusStopGroup
    {
        return $this->group;
    }

    public function changeGroup(?BusStopGroup $group): void
    {
        $this->group = $group;
    }
}